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

  let entriesQuery = supabase
    .from("entries")
    .select(`
      *,
      category:categories(*)
    `, { count: "exact" })
    .is("deleted_at", null)
    .order("pinned", { ascending: false });

  if (hasStatusColumn) {
    // New public-library behavior
    if (user) {
      entriesQuery = entriesQuery.or(`status.eq.PUBLISHED,user_id.eq.${user.id}`);
    } else {
      entriesQuery = entriesQuery.eq("status", "PUBLISHED");
    }
  } else {
    // Old private-library behavior - only show user's own entries
    if (user) {
      entriesQuery = entriesQuery.eq("user_id", user.id);
    } else {
      // Not signed in without status column - show nothing
      entriesQuery = entriesQuery.eq("user_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: entries, count, error: entriesError } = await entriesQuery
    .order(hasStatusColumn ? "published_at" : "created_at", { ascending: false, nullsFirst: false })
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
