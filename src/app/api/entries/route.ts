import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEntrySchema, readEntryJson } from "@/lib/validation/entry";
import { z } from "zod";

const entryListQuerySchema = z.object({
  scope: z.enum(["library", "mine"]).optional().default("library"),
  q: z.string().max(200).optional(),
  category_id: z.string().uuid().optional(),
  type: z.enum(["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"]).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  platform: z.enum(["Windows", "Android", "iOS", "macOS", "Linux", "Web", "Cross-platform"]).optional(),
  pricing: z.enum(["free", "freemium", "paid"]).optional(),
  favorited: z.enum(["true", "false"]).optional(),
}).strict();

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rawFilters = Object.fromEntries(
    ["scope", "q", "category_id", "type", "difficulty", "platform", "pricing", "favorited"]
      .flatMap((key) => {
        const value = searchParams.get(key);
        return value === null ? [] : [[key, value]];
      })
  );
  const parsedFilters = entryListQuerySchema.safeParse(rawFilters);
  if (!parsedFilters.success) {
    return NextResponse.json({ error: "Invalid entry filters" }, { status: 400 });
  }
  const { scope, q, category_id, type, difficulty, platform, pricing, favorited } = parsedFilters.data;
  const limit = Number(searchParams.get("limit") ?? 100);
  const offset = Number(searchParams.get("offset") ?? 0);
  if (
    !Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
    !Number.isSafeInteger(offset) || offset < 0
  ) {
    return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
  }

  // Check if status column exists (backward compatibility)
  let hasStatusColumn = false;
  try {
    const { error: statusCheckError } = await supabase
      .from("entries")
      .select("status")
      .limit(1);
    hasStatusColumn = !statusCheckError;
  } catch {
    hasStatusColumn = false;
  }

  let query = supabase
    .from("entries")
    .select("*, category:categories(*), links:entry_links(*)", { count: "exact" })
    .is("deleted_at", null)
    .order("pinned", { ascending: false });

  if (scope === "mine") {
    query = query
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
  } else {
    if (hasStatusColumn) {
      // New public-library behavior
      query = query
        .or(`status.eq.PUBLISHED,user_id.eq.${user.id}`)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else {
      // Old private-library behavior - show user's own entries
      query = query
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
    }
  }

  query = query
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  if (q) {
    const safeSearch = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    query = query.or(
      `title.ilike."%${safeSearch}%",what_it_is.ilike."%${safeSearch}%",command_snippet.ilike."%${safeSearch}%"`
    );
  }
  if (category_id) query = query.eq("category_id", category_id);
  if (type) query = query.eq("type", type);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (platform) query = query.eq("platform", platform);
  if (pricing) query = query.eq("pricing", pricing);
  if (favorited !== undefined) query = query.eq("favorited", favorited === "true");

  const { data, error, count } = await query;
  if (error) {
    console.error("Entry list query failed:", error.message);
    return NextResponse.json({ error: "Could not load entries" }, { status: 500 });
  }

  return NextResponse.json({ entries: data, total: count });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if status column exists (backward compatibility)
  let hasStatusColumn = false;
  try {
    const { error: statusCheckError } = await supabase
      .from("entries")
      .select("status")
      .limit(1);
    hasStatusColumn = !statusCheckError;
  } catch {
    hasStatusColumn = false;
  }

  const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const role = dbUser?.role || "CONTRIBUTOR";

  let body: unknown;
  try {
    body = await readEntryJson(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Entry request exceeds the 256 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry details", details: parsed.error.issues }, { status: 400 });
  }
  const entry = parsed.data;

  if (entry.category_id) {
    // Categories are shared in the public-library model, so an authenticated
    // contributor may attach an entry to any existing category.
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", entry.category_id)
      .maybeSingle();
    if (categoryError) {
      console.error("Entry category validation failed:", categoryError.message);
      return NextResponse.json({ error: "Could not validate the selected category" }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json({ error: "Selected category was not found" }, { status: 400 });
    }
  }

  // Prepare insert data
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    ...entry,
    pinned: false,
    favorited: false,
  };

  // Only add status if column exists
  if (hasStatusColumn) {
    let finalStatus = entry.status;
    if (finalStatus === "PUBLISHED" && !["TRUSTED_CONTRIBUTOR", "MODERATOR", "ADMIN"].includes(role)) {
      // Contributors must go through review
      finalStatus = "PENDING";
    }
    insertData.status = finalStatus;
  }

  const { data, error } = await supabase
    .from("entries")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Entry creation failed:", error.message);
    return NextResponse.json({ error: "Could not create entry" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
