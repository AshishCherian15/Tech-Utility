"use client";

import { useState } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import type { Entry } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface TrashClientProps {
  initialEntries: Entry[];
}

export default function TrashClient({ initialEntries }: TrashClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [restoringIds, setRestoringIds] = useState<Set<string>>(() => new Set());
  const { success, error } = useToast();

  const restore = async (id: string) => {
    if (restoringIds.has(id)) return;
    setRestoringIds(current => new Set(current).add(id));
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: null }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Could not restore the entry");
      }
    } catch {
      error("Could not restore the entry");
      setRestoringIds(current => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      return;
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    setRestoringIds(current => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    success("Entry restored");
  };

  return (
    <div className="trash-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trash</h1>
          <p className="page-sub" role="status" aria-live="polite" aria-atomic="true">
            {entries.length} deleted {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Trash2 size={40} aria-hidden="true" /></div>
          <h2 className="empty-state-title">Trash is empty</h2>
          <p className="empty-state-desc">Deleted entries stay here until restored.</p>
        </div>
      ) : (
        <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map(entry => (
              <div key={entry.id} className="trash-item" aria-busy={restoringIds.has(entry.id)}>
                <div className="trash-item-info">
                  <div className="trash-item-title">{entry.title}</div>
                  <div className="trash-item-meta">
                    {entry.category?.name ?? "Uncategorized"} · {entry.type}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => restore(entry.id)}
                  disabled={restoringIds.has(entry.id)}
                  aria-label={restoringIds.has(entry.id) ? `Restoring ${entry.title}` : `Restore ${entry.title}`}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  {restoringIds.has(entry.id) ? "Restoring…" : "Restore"}
                </button>
              </div>
          ))}
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

        @media (max-width: 768px) {
          .page-header { padding: 20px 16px 16px; }
        }
      `}</style>
    </div>
  );
}
