import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ShellLayout from "@/components/ShellLayout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch entries for command palette (id + title + tags + type only)
  const { data: entries } = await supabase
    .from("entries")
    .select("id, title, tags, type, category_id")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  return (
    <ShellLayout user={user} entries={entries ?? []}>
      {children}
    </ShellLayout>
  );
}
