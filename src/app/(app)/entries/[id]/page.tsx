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
    .select("title, what_it_is, status")
    .eq("id", id)
    .single();

  return {
    title: entry?.title ?? "Entry",
    description: entry?.what_it_is ?? undefined,
    robots: entry?.status !== "PUBLISHED" ? { index: false, follow: false } : undefined,
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

  // Generate structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.what_it_is,
    image: entry.cover_image_url ? [entry.cover_image_url] : undefined,
    datePublished: new Date(entry.created_at).toISOString(),
    dateModified: new Date(entry.updated_at).toISOString(),
    author: {
      "@type": "Person",
      name: "ByteShelf Contributor",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EntryDetail entry={entry} />
    </>
  );
}
