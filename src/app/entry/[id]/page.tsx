import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntryDetail from "@/components/EntryDetail";
import { createClient } from "@/lib/supabase/server";

interface PublicEntryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PublicEntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase
    .from("entries")
    .select("title, what_it_is, cover_image_url")
    .eq("id", id)
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .maybeSingle();

  if (!entry) {
    return {
      title: "Entry not found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: entry.title,
    description: entry.what_it_is ?? undefined,
    openGraph: {
      title: entry.title,
      description: entry.what_it_is ?? undefined,
      images: entry.cover_image_url ? [entry.cover_image_url] : undefined,
    },
  };
}

export default async function PublicEntryPage({ params }: PublicEntryPageProps) {
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
    .eq("status", "PUBLISHED")
    .is("deleted_at", null)
    .maybeSingle();

  if (!entry) notFound();

  return <EntryDetail entry={entry} publicView backHref="/" backLabel="ByteShelf" />;
}
