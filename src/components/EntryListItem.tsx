"use client";

import Link from "next/link";
import { Star, Pin, Check, Terminal } from "lucide-react";
import { useState } from "react";
import type { Entry } from "@/lib/types";
import { formatRelativeDate, truncate } from "@/lib/utils";

interface EntryListItemProps {
  entry: Entry;
  typeColorClass: string;
  userId?: string | null;
}

export default function EntryListItem({ entry, typeColorClass, userId }: EntryListItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (entry.command_snippet) {
      await navigator.clipboard.writeText(entry.command_snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Link href={`/entries/${entry.id}`} className="list-item">
      <div className="list-item-left">
        <span className={`badge ${typeColorClass}`}>{entry.type}</span>
        {entry.status === "PENDING" && userId === entry.user_id && (
          <span
            className="badge"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              color: "#f59e0b",
              fontSize: 10,
              marginLeft: 6,
            }}
          >
            Pending
          </span>
        )}
      </div>

      <div className="list-item-body">
        <div className="list-item-title">
          {entry.pinned && <Pin size={12} style={{ color: "var(--brand-blue-bright)" }} />}
          {entry.favorited && <Star size={12} style={{ color: "#fbbf24", fill: "#fbbf24" }} />}
          {entry.title}
        </div>
        {entry.what_it_is && (
          <div className="list-item-desc">{truncate(entry.what_it_is, 120)}</div>
        )}
        <div className="list-item-meta">
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {entry.category?.name ?? "Uncategorized"}
          </span>
          {entry.tags?.slice(0, 3).map(t => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
          {entry.platform && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{entry.platform}</span>
          )}
        </div>
      </div>

      <div className="list-item-right">
        {entry.command_snippet && (
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={handleCopy}
            data-tooltip={copied ? "Copied!" : "Copy command"}
            aria-label="Copy command"
          >
            {copied ? <Check size={14} style={{ color: "#4ade80" }} /> : <Terminal size={14} />}
          </button>
        )}
        <span className="list-item-time">{formatRelativeDate(entry.created_at)}</span>
      </div>

      <style>{`
        .list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .list-item:hover {
          border-color: var(--border-default);
          background: var(--bg-card-hover);
        }

        .list-item-left {
          flex-shrink: 0;
          min-width: 80px;
        }

        .list-item-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .list-item-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .list-item-desc {
          font-size: 12.5px;
          color: var(--text-muted);
        }

        .list-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .list-item-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .list-item-time {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </Link>
  );
}
