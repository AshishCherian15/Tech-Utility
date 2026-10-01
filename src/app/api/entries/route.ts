import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category_id = searchParams.get("category_id");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const platform = searchParams.get("platform");
  const favorited = searchParams.get("favorited");
  const limit = Number(searchParams.get("limit") ?? 100);
  const offset = Number(searchParams.get("offset") ?? 0);

  let query = supabase
    .from("entries")
    .select("*, category:categories(*), links:entry_links(*)", { count: "exact" })
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,what_it_is.ilike.%${q}%,command_snippet.ilike.%${q}%`
    );
  }
  if (category_id) query = query.eq("category_id", category_id);
  if (type) query = query.eq("type", type);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (platform) query = query.eq("platform", platform);
  if (favorited === "true") query = query.eq("favorited", true);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: data, total: count });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      title: (body.title as string).trim(),
      category_id: body.category_id ?? null,
      type: body.type ?? "Tip",
      tags: body.tags ?? [],
      what_it_is: body.what_it_is ?? null,
      why_useful: body.why_useful ?? null,
      who_can_use: body.who_can_use ?? null,
      when_to_use: body.when_to_use ?? null,
      how_to_use: body.how_to_use ?? null,
      example: body.example ?? null,
      difficulty: body.difficulty ?? null,
      platform: body.platform ?? null,
      command_snippet: body.command_snippet ?? null,
      images: body.images ?? [],
      color: body.color ?? null,
      pinned: false,
      favorited: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
