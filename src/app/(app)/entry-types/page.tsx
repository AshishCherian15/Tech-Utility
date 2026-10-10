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

  let entryTypes = [];
  try {
    const { data, error } = await supabase
      .from("entry_types")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      // If table doesn't exist, use fallback types
      if (error.message.includes('does not exist') || error.code === '42P01') {
        entryTypes = [
          { id: 'default-1', name: 'command', description: 'Terminal commands and CLI tools', icon: 'terminal', color: 'blue', is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-2', name: 'app', description: 'Desktop applications and GUI tools', icon: 'monitor', color: 'green', is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-3', name: 'website', description: 'Web applications and online services', icon: 'globe', color: 'cyan', is_active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-4', name: 'extension', description: 'Browser extensions and plugins', icon: 'puzzle', color: 'purple', is_active: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-5', name: 'library', description: 'Code libraries and frameworks', icon: 'code', color: 'blue', is_active: true, sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-6', name: 'workflow', description: 'Automations and processes', icon: 'workflow', color: 'cyan', is_active: true, sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-7', name: 'guide', description: 'Tutorials and documentation', icon: 'book', color: 'blue', is_active: true, sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'default-8', name: 'tool', description: 'Utilities and helper tools', icon: 'wrench', color: 'gray', is_active: true, sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];
      } else {
        throw error;
      }
    } else {
      entryTypes = data ?? [];
    }
  } catch (e) {
    console.error("Failed to load entry types:", e instanceof Error ? e.message : 'Unknown error');
    entryTypes = [];
  }

  return <EntryTypesClient entryTypes={entryTypes} />;
}
