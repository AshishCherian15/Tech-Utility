import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EntryTypesClient from "@/components/EntryTypesClient";

export const metadata: Metadata = {
  title: "Entry Types",
  description: "Manage entry types for ByteShelf.",
};

export default async function EntryTypesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(ownerEmail && user.email?.toLowerCase() === ownerEmail);

  if (!isOwner) {
    redirect("/dashboard");
  }

  const { data: entryTypes, error } = await supabase
    .from("entry_types")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return <EntryTypesClient entryTypes={entryTypes ?? []} />;
}
