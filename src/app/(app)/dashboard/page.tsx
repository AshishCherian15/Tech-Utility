import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your ByteShelf knowledge base — search, browse, and manage your saved tech discoveries.",
};

interface DashboardPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let entriesQuery = supabase
    .from("entries")
    .select(`
      *,
      category:categories(*)
    `, { count: "exact" })
    .is("deleted_at", null)
    .order("pinned", { ascending: false });

  if (user) {
    entriesQuery = entriesQuery.or(`status.eq.PUBLISHED,user_id.eq.${user.id}`);
  } else {
    entriesQuery = entriesQuery.eq("status", "PUBLISHED");
  }

  const { data: entries, count, error: entriesError } = await entriesQuery
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, 99);
  if (entriesError) throw entriesError;

  // Fetch categories with counts
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (categoriesError) throw categoriesError;

  return (
    <DashboardClient
      key={`${params.category ?? ""}:${params.sort ?? ""}`}
      initialEntries={entries ?? []}
      totalEntries={count ?? entries?.length ?? 0}
      categories={categories ?? []}
      initialCategoryId={params.category ?? ""}
      initialSort={params.sort === "recently_edited" ? "recently_edited" : "newest"}
    />
  );
}
