import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>
): Promise<{ data: T[] | null; error: string | null }> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await fetchPage(offset, offset + PAGE_SIZE - 1);
    if (error) return { data: null, error: error.message };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return { data: rows, error: null };
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: entries, error: entriesError },
    { data: categories, error: categoriesError },
    { data: entry_links, error: linksError },
  ] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name")
        .order("id", { ascending: true })
        .range(from, to)
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("entry_links")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true })
        .range(from, to)
    ),
  ]);

  const queryError = entriesError ?? categoriesError ?? linksError;
  if (queryError) {
    console.error("Library export query failed:", queryError);
    return NextResponse.json({ error: "Could not export the library" }, { status: 500 });
  }

  const exportData = {
    version: 1,
    exported_at: new Date().toISOString(),
    user_email: user.email,
    entries,
    categories,
    entry_links,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="byteshelf-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
