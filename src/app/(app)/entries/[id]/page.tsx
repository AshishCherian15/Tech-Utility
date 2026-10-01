import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryDetail from "@/components/EntryDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("entries")
    .select("title, what_it_is")
    .eq("id", id)
    .single();

  return {
    title: entry?.title ?? "Entry",
    description: entry?.what_it_is ?? undefined,
  };
}

export default async function EntryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("entries")
    .select(`
      *,
      category:categories(*),
      links:entry_links(*)
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!entry) notFound();

  return <EntryDetail entry={entry} />;
}
