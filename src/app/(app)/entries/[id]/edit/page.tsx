import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryForm from "@/components/EntryForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: entry }, { data: categories }] = await Promise.all([
    supabase
      .from("entries")
      .select("*, links:entry_links(*)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!entry) notFound();

  return <EntryForm categories={categories ?? []} entry={entry} />;
}
