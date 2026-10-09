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

  // Check if status column exists (backward compatibility)
  let hasStatusColumn = false;
  try {
    const { error: statusCheckError } = await supabase
      .from("entries")
      .select("status")
      .limit(1);
    hasStatusColumn = !statusCheckError;
  } catch {
    hasStatusColumn = false;
  }

  // Fetch pending entries
  let query = supabase
    .from("entries")
    .select(`*, category:categories(*)`)
    .is("deleted_at", null);

  if (hasStatusColumn) {
    query = query.eq("status", "PENDING");
  } else {
    // Without status column, no review queue - return empty
    query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
  }

  query = query.order("created_at", { ascending: false });

  const { data: pendingEntries, error } = await query;

  if (error) {
    console.error("Failed to load review queue:", error.message);
  }

  return <ReviewQueueClient initialEntries={pendingEntries ?? []} />;
}
