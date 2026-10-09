"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Check, X, Loader2 } from "lucide-react";
import type { Entry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface ReviewQueueClientProps {
  initialEntries: Entry[];
}

const TYPE_COLORS: Record<string, string> = {
  Tip: "badge-blue",
  Trick: "badge-purple",
  Hack: "badge-orange",
  App: "badge-green",
  Website: "badge-cyan",
  Tool: "badge-cyan",
  Extension: "badge-purple",
  Command: "badge-orange",
  Guide: "badge-blue",
  Prompt: "badge-pink",
};

export default function ReviewQueueClient({ initialEntries }: ReviewQueueClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [processing, setProcessing] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const handleAction = async (id: string, newStatus: "PUBLISHED" | "REJECTED") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update entry");
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
      success(`Entry ${newStatus.toLowerCase()} successfully`);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Error processing entry");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="review-queue-page" style={{ padding: "32px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <ClipboardCheck size={24} className="text-brand-blue" />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Review Queue</h1>
      </div>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
        These entries have been submitted by contributors and are waiting for your approval.
      </p>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", background: "var(--bg-card)", borderRadius: 12, border: "1px dashed var(--border-subtle)" }}>
          <ClipboardCheck size={40} style={{ margin: "0 auto 16px", color: "var(--text-muted)", opacity: 0.5 }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>All caught up!</h2>
          <p style={{ color: "var(--text-muted)" }}>There are no entries pending review.</p>
        </div>
      ) : (
        <div className="review-queue-list" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {entries.map((entry) => (
            <div key={entry.id} style={{ display: "flex", gap: 16, background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 12, padding: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className={cn("badge", TYPE_COLORS[entry.type] || "badge-blue")}>{entry.type}</span>
                  {entry.category?.name && <span className="badge badge-gray">{entry.category.name}</span>}
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                <Link href={`/entries/${entry.id}`} style={{ display: "block", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, textDecoration: "none" }}>
                  {entry.title}
                </Link>
                {entry.what_it_is && <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{entry.what_it_is}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, width: 140 }}>
                <button
                  onClick={() => handleAction(entry.id, "PUBLISHED")}
                  disabled={processing === entry.id}
                  className="btn btn-primary"
                  style={{ minHeight: 44, width: "100%", justifyContent: "center" }}
                >
                  {processing === entry.id ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  Approve
                </button>
                <button
                  onClick={() => handleAction(entry.id, "REJECTED")}
                  disabled={processing === entry.id}
                  className="btn btn-secondary"
                  style={{ minHeight: 44, width: "100%", justifyContent: "center" }}
                >
                  {processing === entry.id ? <Loader2 size={16} className="spin" /> : <X size={16} />}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
