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

  // Check if status column exists (backward compatibility)
  let hasStatusColumn = false;
  try {
    const { error: statusCheckError } = await supabase
      .from("entries")
      .select("status")
      .limit(1);
    hasStatusColumn = !statusCheckError;
  } catch {
    hasStatusColumn = false;
  }

  let query = supabase
    .from("entries")
    .select("title, what_it_is, cover_image_url")
    .eq("id", id)
    .is("deleted_at", null);

  if (hasStatusColumn) {
    query = query.eq("status", "PUBLISHED");
  }

  const { data: entry } = await query.maybeSingle();

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

  // Check if status column exists (backward compatibility)
  let hasStatusColumn = false;
  try {
    const { error: statusCheckError } = await supabase
      .from("entries")
      .select("status")
      .limit(1);
    hasStatusColumn = !statusCheckError;
  } catch {
    hasStatusColumn = false;
  }

  let query = supabase
    .from("entries")
    .select(`
      *,
      category:categories(*),
      links:entry_links(*)
    `)
    .eq("id", id)
    .is("deleted_at", null);

  if (hasStatusColumn) {
    query = query.eq("status", "PUBLISHED");
  }

  const { data: entry } = await query.maybeSingle();

  if (!entry) notFound();

  return <EntryDetail entry={entry} publicView backHref="/" backLabel="ByteShelf" />;
}
