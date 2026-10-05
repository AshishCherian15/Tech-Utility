import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TrashClient from "@/components/TrashClient";

export const metadata: Metadata = {
  title: "Trash",
  description: "View and restore recently deleted entries.",
};

export default async function TrashPage() {
  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from("entries")
    .select("*, category:categories(*)")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });
  if (error) throw error;

  return <TrashClient initialEntries={entries} />;
}
