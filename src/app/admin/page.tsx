import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Database, Shield, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
  description: "Protected ByteShelf administration overview.",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const isOwner = Boolean(ownerEmail && user.email?.toLowerCase() === ownerEmail);
  const canAdmin = isOwner || dbUser?.role === "ADMIN" || dbUser?.role === "MODERATOR";

  if (!canAdmin) redirect("/dashboard");

  const adminCards = [
    {
      href: "/review-queue",
      icon: ClipboardCheck,
      title: "Review Queue",
      body: "Approve, reject, and inspect pending contributor submissions.",
    },
    {
      href: "/users",
      icon: Users,
      title: "User Accounts",
      body: "Manage invited accounts, access duration, and owner-created users.",
    },
    {
      href: "/settings",
      icon: Shield,
      title: "Security Settings",
      body: "Review account deletion, password, AI key, and cache controls.",
    },
    {
      href: "/changelog",
      icon: Database,
      title: "Operational Notes",
      body: "Track product changes, release notes, and transparency updates.",
    },
  ];

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <p className="public-info-eyebrow">Protected</p>
        <h1>Admin Panel</h1>
        <p>Server-side protected management shortcuts for ByteShelf moderators and owners.</p>
      </header>
      <section className="admin-grid" aria-label="Admin tools">
        {adminCards.map(({ href, icon: Icon, title, body }) => (
          <Link key={href} href={href} className="admin-card">
            <Icon size={22} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
