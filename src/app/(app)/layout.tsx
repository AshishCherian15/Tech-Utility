import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AppShellClient from "@/components/AppShellClient";

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
    <div className="app-shell">
      <Sidebar user={user} />
      <div className="main-content">
        <MobileNav user={user} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
      <AppShellClient entries={entries ?? []} />
    </div>
  );
}
