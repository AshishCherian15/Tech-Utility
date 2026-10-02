"use client";

import Link from "next/link";
import { Star, Pin, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Entry } from "@/lib/types";
import { formatRelativeDate, truncate } from "@/lib/utils";

interface EntryCardProps {
  entry: Entry;
  typeColorClass: string;
}

const CARD_COLORS: Record<string, string> = {
  "#blue": "rgba(59,130,246,0.08)",
  "#purple": "rgba(139,92,246,0.08)",
  "#green": "rgba(34,197,94,0.08)",
  "#orange": "rgba(249,115,22,0.08)",
  "#pink": "rgba(236,72,153,0.08)",
  "#yellow": "rgba(234,179,8,0.08)",
  "#teal": "rgba(20,184,166,0.08)",
  "#red": "rgba(239,68,68,0.08)",
};

export default function EntryCard({ entry, typeColorClass }: EntryCardProps) {
  const [copied, setCopied] = useState(false);

  const cardBg = entry.color ? CARD_COLORS[entry.color] ?? "var(--bg-card)" : "var(--bg-card)";

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
    <Link href={`/entries/${entry.id}`} className="entry-card" style={{ background: cardBg }}>
      <div className="entry-card-header">
        <div className="entry-card-meta">
          <span className={`badge ${typeColorClass}`}>{entry.type}</span>
          {entry.difficulty && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {entry.difficulty}</span>
          )}
        </div>
        <div className="entry-card-actions">
          {entry.favorited && <Star size={13} style={{ color: "#fbbf24", fill: "#fbbf24" }} />}
          {entry.pinned && <Pin size={12} style={{ color: "var(--brand-blue-bright)" }} />}
        </div>
      </div>

      <h2 className="entry-card-title">{truncate(entry.title, 60)}</h2>

      {entry.what_it_is && (
        <p className="entry-card-desc">{truncate(entry.what_it_is, 100)}</p>
      )}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="entry-card-tags">
          {entry.tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
          {entry.tags.length > 4 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>+{entry.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Command snippet preview */}
      {entry.command_snippet && (
        <div className="entry-card-snippet">
          <Terminal size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <code className="entry-card-code">{truncate(entry.command_snippet, 50)}</code>
          <button
            className="entry-card-copy"
            onClick={handleCopy}
            data-tooltip={copied ? "Copied!" : "Copy"}
            aria-label="Copy command"
          >
            {copied ? <Check size={12} style={{ color: "#4ade80" }} /> : <Copy size={12} />}
          </button>
        </div>
      )}

      <div className="entry-card-footer">
        <span className="entry-card-category">
          {entry.category?.icon && <span>{entry.category.icon}</span>}
          {entry.category?.name ?? "Uncategorized"}
        </span>
        {entry.platform && (
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{entry.platform}</span>
        )}
        <span className="entry-card-time">{formatRelativeDate(entry.created_at)}</span>
      </div>

      {/* Xiaomi Notes style top image preview */}
      {entry.images && entry.images.length > 0 && (
        <div style={{ margin: "-16px -16px 4px -16px", height: 130, overflow: "hidden", borderBottom: "1px solid var(--border-card)", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.images[0]}
            alt={entry.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
          />
          {entry.command_snippet && (
            <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#fff" }}>
              <ExternalLink size={10} /> Link
            </div>
          )}
        </div>
      )}

      <style>{`
        .entry-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-card);
          text-decoration: none;
          transition: all var(--transition-base);
          cursor: pointer;
          overflow: hidden;
        }

        .entry-card:hover {
          border-color: var(--border-default);
          box-shadow: var(--shadow-card), var(--shadow-glow);
          transform: translateY(-2px);
        }

        .entry-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .entry-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .entry-card-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .entry-card-title {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
        }

        .entry-card-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        .entry-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .entry-card-snippet {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 8px;
          padding: 7px 10px;
          min-width: 0;
        }

        .entry-card-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: #93c5fd;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entry-card-copy {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 2px;
          display: flex;
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .entry-card-copy:hover {
          color: var(--brand-blue-bright);
        }

        .entry-card-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .entry-card-category {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--text-muted);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entry-card-time {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .entry-card-img-strip {
          margin: 0 -16px -16px;
          border-top: 1px solid var(--border-card);
          overflow: hidden;
        }
      `}</style>
    </Link>
  );
}
