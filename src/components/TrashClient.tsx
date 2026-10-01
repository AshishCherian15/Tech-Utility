"use client";

import { useState } from "react";
import { Trash2, RotateCcw, Clock } from "lucide-react";
import type { Entry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface TrashClientProps {
  initialEntries: Entry[];
}

function daysRemaining(deletedAt: string) {
  const deleted = new Date(deletedAt);
  const expiry = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export default function TrashClient({ initialEntries }: TrashClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const supabase = createClient();

  const restore = async (id: string) => {
    await supabase.from("entries").update({ deleted_at: null }).eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="trash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trash</h1>
          <p className="page-sub">
            {entries.length} deleted {entries.length === 1 ? "entry" : "entries"} · auto-purged after 30 days
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Trash2 size={40} /></div>
          <h2 className="empty-state-title">Trash is empty</h2>
          <p className="empty-state-desc">Deleted entries appear here for 30 days before permanent removal</p>
        </div>
      ) : (
        <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(entry => {
            const days = daysRemaining(entry.deleted_at!);
            return (
              <div key={entry.id} className="trash-item">
                <div className="trash-item-info">
                  <div className="trash-item-title">{entry.title}</div>
                  <div className="trash-item-meta">
                    {entry.category?.name ?? "Uncategorized"} · {entry.type}
                  </div>
                </div>
                <div className="trash-item-days">
                  <Clock size={12} />
                  {days === 0 ? "Expires today" : `${days}d remaining`}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => restore(entry.id)}
                  aria-label="Restore entry"
                >
                  <RotateCcw size={13} />
                  Restore
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .trash-page { min-height: 100vh; }

        .trash-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          transition: all 0.15s;
        }

        .trash-item:hover {
          border-color: var(--border-default);
        }

        .trash-item-info {
          flex: 1;
          min-width: 0;
        }

        .trash-item-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .trash-item-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .trash-item-days {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .page-header { padding: 20px 16px 16px; }
        }
      `}</style>
    </div>
  );
}
