import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { AccountAccessManagement } from "@/components/SettingsClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "User accounts",
  description: "Create and manage invited Tech-Utility accounts.",
};

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ownerEmail = process.env.ASH_OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || user.email?.toLowerCase() !== ownerEmail) redirect("/dashboard");

  return (
    <div className="users-page">
      <header className="users-page-header">
        <div className="users-page-icon"><Users size={22} aria-hidden="true" /></div>
        <div>
          <p className="users-page-eyebrow">OWNER WORKSPACE</p>
          <h1>User accounts</h1>
          <p className="users-page-description">
            Create invited accounts and control access. Temporary accounts expire automatically;
            users sign in with the email and password you assign.
          </p>
        </div>
      </header>
      <section className="settings-card users-page-card" aria-label="Account creation and access">
        <AccountAccessManagement />
      </section>
    </div>
  );
}
