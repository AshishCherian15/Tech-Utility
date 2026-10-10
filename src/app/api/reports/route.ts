import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reportSchema = z.object({
  entry_id: z.string().uuid(),
  reason: z.string().min(1).max(1000),
}).strict();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report details", details: parsed.error.issues }, { status: 400 });
  }
  const { entry_id, reason } = parsed.data;

  // Verify the entry exists and is published
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select("id, status")
    .eq("id", entry_id)
    .single();

  if (entryError || !entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
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

  // Only allow reporting published entries if status column exists
  if (hasStatusColumn && entry.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Only published entries can be reported" }, { status: 400 });
  }

  // Check if user already reported this entry
  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("entry_id", entry_id)
    .eq("reported_by_id", user.id)
    .maybeSingle();

  if (existingReport) {
    return NextResponse.json({ error: "You have already reported this entry" }, { status: 409 });
  }

  // Create the report
  const { data, error } = await supabase
    .from("reports")
    .insert({
      entry_id,
      reported_by_id: user.id,
      reason,
    })
    .select()
    .single();

  if (error) {
    console.error("Report creation failed:", error.message);
    return NextResponse.json({ error: "Could not submit report" }, { status: 500 });
  }

  // If status column exists, flag the entry for review
  if (hasStatusColumn) {
    await supabase
      .from("entries")
      .update({ status: "FLAGGED" })
      .eq("id", entry_id);
  }

  return NextResponse.json(data, { status: 201 });
}
