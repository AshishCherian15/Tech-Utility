import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your starred Ash-Tech entries.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();

  const [{ data: entries }, { data: categories }] = await Promise.all([
    supabase
      .from("entries")
      .select("*, category:categories(*), links:entry_links(*)")
      .is("deleted_at", null)
      .eq("favorited", true)
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <DashboardClient
      initialEntries={entries ?? []}
      categories={categories ?? []}
      pageTitle="Favorites"
      emptyMessage="No favorites yet — star an entry to see it here."
    />
  );
}
