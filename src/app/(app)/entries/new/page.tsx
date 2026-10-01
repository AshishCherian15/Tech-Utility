import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";

export const metadata: Metadata = {
  title: "New Entry",
  description: "Add a new tech tip, command, app, tool or discovery to Ash-Tech.",
};

export default async function NewEntryPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return <EntryForm categories={categories ?? []} />;
}
