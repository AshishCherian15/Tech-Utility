import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReviewQueueClient from "@/components/ReviewQueueClient";

export const metadata: Metadata = {
  title: "Review Queue",
  description: "Moderation queue for ByteShelf entries.",
};

export default async function ReviewQueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single();
  const userRole = dbUser?.role || "CONTRIBUTOR";
  const ownerEmail = process.env.BYTESHELF_ADMIN_EMAIL?.trim().toLowerCase();
  const isOwner = Boolean(ownerEmail && user.email?.toLowerCase() === ownerEmail);
  const canModerate = isOwner || userRole === "MODERATOR" || userRole === "ADMIN";

  if (!canModerate) {
    redirect("/dashboard");
  }

  // Fetch pending entries
  const { data: pendingEntries, error } = await supabase
    .from("entries")
    .select(`*, category:categories(*)`)
    .eq("status", "PENDING")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load review queue:", error.message);
  }

  return <ReviewQueueClient initialEntries={pendingEntries ?? []} />;
}
