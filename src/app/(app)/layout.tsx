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

  const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(user && ownerEmail && user.email?.toLowerCase() === ownerEmail);

  // Fetch entries for command palette (id + title + tags + type only)
  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, title, tags, type, category_id")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  let userRole = "VISITOR";
  if (user) {
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (dbUser) {
      userRole = dbUser.role;
    }
  }

  return (
    <ShellLayout user={user} entries={entries} isOwner={isOwner} userRole={userRole}>
      {children}
    </ShellLayout>
  );
}
