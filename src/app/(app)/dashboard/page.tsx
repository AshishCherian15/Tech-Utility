import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Ash-Tech knowledge base — search, browse, and manage your saved tech discoveries.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch entries
  const { data: entries } = await supabase
    .from("entries")
    .select(`
      *,
      category:categories(*)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch categories with counts
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <DashboardClient
      initialEntries={entries ?? []}
      categories={categories ?? []}
    />
  );
}
