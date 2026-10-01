import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all data
  const [
    { data: entries },
    { data: categories },
    { data: entry_links },
  ] = await Promise.all([
    supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("entry_links")
      .select("*")
      .eq("user_id", user.id),
  ]);

  const exportData = {
    version: 1,
    exported_at: new Date().toISOString(),
    user_email: user.email,
    entries: entries ?? [],
    categories: categories ?? [],
    entry_links: entry_links ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ash-tech-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
