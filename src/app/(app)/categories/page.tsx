import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "@/components/CategoriesClient";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage your Tech-Utility entry categories.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*, entries(count)")
    .is("entries.deleted_at", null)
    .order("name");
  if (error) throw error;

  const categoriesWithCounts = categories.map((category) => {
    const { entries, ...categoryData } = category;
    return { ...categoryData, entry_count: entries?.[0]?.count ?? 0 };
  });

  return <CategoriesClient initialCategories={categoriesWithCounts} />;
}
