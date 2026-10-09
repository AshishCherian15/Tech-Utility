import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your starred ByteShelf entries.",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [entriesResult, categoriesResult] = await Promise.all([
    supabase
      .from("entries")
      .select("*, category:categories(*), links:entry_links(*)")
      .is("deleted_at", null)
      .eq("favorited", true)
      .order("updated_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);
  if (entriesResult.error) throw entriesResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  return (
    <DashboardClient
      initialEntries={entriesResult.data}
      categories={categoriesResult.data}
      pageTitle="Favorites"
      emptyMessage="No favorites yet — star an entry to see it here."
    />
  );
}

