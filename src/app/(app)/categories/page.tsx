import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "@/components/CategoriesClient";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage your Ash-Tech entry categories.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return <CategoriesClient initialCategories={categories ?? []} />;
}
