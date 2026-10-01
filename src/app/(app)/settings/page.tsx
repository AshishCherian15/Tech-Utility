import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "@/components/SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Ash-Tech account, appearance, and data.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: entryCount } = await supabase
    .from("entries")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  return <SettingsClient user={user!} entryCount={entryCount ?? 0} />;
}
