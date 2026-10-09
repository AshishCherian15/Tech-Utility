import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EntryForm from "@/components/EntryForm";
import type { EntryType } from "@/lib/types";

export const metadata: Metadata = {
  title: "New Entry",
  description: "Add a new tech tip, command, app, tool or discovery to ByteShelf.",
};

interface NewEntryPageProps {
  searchParams: Promise<{ title?: string; text?: string; url?: string; type?: string }>;
}

export default async function NewEntryPage({ searchParams }: NewEntryPageProps) {
  const shared = await searchParams;
  const allowedTypes: EntryType[] = ["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"];
  const initialType = allowedTypes.find((type) => type === shared.type);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;

  const sharedContent = {
    title: shared.title?.slice(0, 500),
    text: shared.text?.slice(0, 8000),
    url: shared.url?.slice(0, 2048),
  };

  return <EntryForm categories={categories} sharedContent={sharedContent} initialType={initialType} />;
}
