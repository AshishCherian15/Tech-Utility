import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your ByteShelf account, appearance, and data.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: entryCount, error } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);
  if (error) throw error;

  const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(ownerEmail && user.email?.toLowerCase() === ownerEmail);

  return <SettingsClient user={user} entryCount={entryCount ?? 0} isOwner={isOwner} />;
}
