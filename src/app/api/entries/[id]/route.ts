import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readEntryJson, updateEntrySchema } from "@/lib/validation/entry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("entries")
    .select("*, category:categories(*), links:entry_links(*)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single();
  const role = dbUser?.role || "CONTRIBUTOR";
  const isModOrAdmin = ["MODERATOR", "ADMIN"].includes(role);

  const { data: existing, error: existingError } = await supabase
    .from("entries")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.user_id !== user.id && !isModOrAdmin) {
    return NextResponse.json({ error: "You can only edit your own entries" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await readEntryJson(request);
  } catch (error) {
    if (error instanceof RangeError) {
      return NextResponse.json({ error: "Entry request exceeds the 256 KB limit" }, { status: 413 });
    }
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry updates", details: parsed.error.issues }, { status: 400 });
  }
  const changes = parsed.data;

  if (changes.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", changes.category_id)
      .maybeSingle();
    if (categoryError) {
      console.error("Entry category validation failed:", categoryError.message);
      return NextResponse.json({ error: "Could not validate the selected category" }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json({ error: "Selected category was not found" }, { status: 400 });
    }
  }

  let finalStatus = changes.status;
  if (finalStatus === "PUBLISHED" && !["TRUSTED_CONTRIBUTOR", "MODERATOR", "ADMIN"].includes(role)) {
    finalStatus = "PENDING";
  }
  if (finalStatus) {
    changes.status = finalStatus;
  }

  const { data, error } = await supabase
    .from("entries")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Entry update failed:", error.message);
    return NextResponse.json({ error: "Could not update entry" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single();
  const role = dbUser?.role || "CONTRIBUTOR";
  const isModOrAdmin = ["MODERATOR", "ADMIN"].includes(role);

  const { data: existing, error: existingError } = await supabase
    .from("entries")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.user_id !== user.id && !isModOrAdmin) {
    return NextResponse.json({ error: "You can only delete your own entries" }, { status: 403 });
  }

  // Soft delete only — set deleted_at
  const { data, error } = await supabase
    .from("entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Entry deletion failed:", error.message);
    return NextResponse.json({ error: "Could not move entry to trash" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
