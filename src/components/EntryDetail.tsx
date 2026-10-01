"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Trash2, Star, Pin, Copy, Check,
  ExternalLink, Terminal, Tag, ChevronRight, Download,
  Globe, Shield, Zap, Clock, Users, BookOpen, Lightbulb
} from "lucide-react";
import type { Entry } from "@/lib/types";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface EntryDetailProps {
  entry: Entry;
}

const TYPE_COLORS: Record<string, string> = {
  Tip: "badge-blue", Trick: "badge-purple", Hack: "badge-orange",
  App: "badge-green", Website: "badge-cyan", Tool: "badge-cyan",
  Extension: "badge-purple", Command: "badge-orange",
  Guide: "badge-blue", Prompt: "badge-pink",
};

export default function EntryDetail({ entry }: EntryDetailProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(entry.favorited);
  const [pinned, setPinned] = useState(entry.pinned);
  const router = useRouter();
  const supabase = createClient();

  const handleCopy = async () => {
    if (entry.command_snippet) {
      await navigator.clipboard.writeText(entry.command_snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFavorite = async () => {
    const newVal = !favorited;
    setFavorited(newVal);
    await supabase.from("entries").update({ favorited: newVal }).eq("id", entry.id);
  };

  const togglePin = async () => {
    const newVal = !pinned;
    setPinned(newVal);
    await supabase.from("entries").update({ pinned: newVal }).eq("id", entry.id);
  };

  const handleDelete = async () => {
    if (!confirm("Move this entry to trash?")) return;
    await supabase
      .from("entries")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", entry.id);
    router.push("/dashboard");
  };

  const typeColor = TYPE_COLORS[entry.type] ?? "badge-blue";

  return (
    <div className="entry-detail">
      {/* Header */}
      <div className="entry-detail-header">
        <div className="entry-detail-nav">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} />
            Back
          </Link>
          <div style={{ display: "flex", gap: 4 }}>
            {/* breadcrumb */}
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Dashboard</span>
            <ChevronRight size={14} style={{ color: "var(--text-muted)", marginTop: 1 }} />
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{entry.title}</span>
          </div>
        </div>

        <div className="entry-detail-actions">
          <button
            id="btn-toggle-favorite"
            className={`btn btn-ghost btn-sm ${favorited ? "text-yellow" : ""}`}
            onClick={toggleFavorite}
            data-tooltip={favorited ? "Unfavorite" : "Favorite"}
            style={favorited ? { color: "#fbbf24" } : {}}
          >
            <Star size={15} fill={favorited ? "#fbbf24" : "none"} />
            {favorited ? "Favorited" : "Favorite"}
          </button>
          <button
            id="btn-toggle-pin"
            className={`btn btn-ghost btn-sm`}
            onClick={togglePin}
            data-tooltip={pinned ? "Unpin" : "Pin to top"}
            style={pinned ? { color: "var(--brand-blue-bright)" } : {}}
          >
            <Pin size={15} />
            {pinned ? "Pinned" : "Pin"}
          </button>
          <Link href={`/entries/${entry.id}/edit`} className="btn btn-secondary btn-sm" id="btn-edit-entry">
            <Edit size={14} />
            Edit
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} id="btn-delete-entry">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="entry-detail-body">
        {/* Main content */}
        <div className="entry-detail-main">
          {/* Title block */}
          <div className="entry-detail-title-block">
            <div className="entry-detail-badges">
              <span className={`badge ${typeColor}`}>{entry.type}</span>
              {entry.difficulty && (
                <span className="badge badge-blue" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", borderColor: "var(--border-card)" }}>
                  {entry.difficulty}
                </span>
              )}
              {entry.platform && (
                <span className="badge badge-blue" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", borderColor: "var(--border-card)" }}>
                  {entry.platform}
                </span>
              )}
              {pinned && <Pin size={14} style={{ color: "var(--brand-blue-bright)" }} />}
              {favorited && <Star size={14} style={{ color: "#fbbf24", fill: "#fbbf24" }} />}
            </div>
            <h1 className="entry-detail-title">{entry.title}</h1>
            <div className="entry-detail-meta">
              <span>{entry.category?.icon} {entry.category?.name ?? "Uncategorized"}</span>
              <span>·</span>
              <Clock size={12} />
              <span>Added {formatDate(entry.created_at)}</span>
              {entry.updated_at !== entry.created_at && (
                <>
                  <span>·</span>
                  <span>Updated {formatRelativeDate(entry.updated_at)}</span>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="entry-section">
              <div className="entry-section-header">
                <Tag size={14} />
                Tags
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {entry.tags.map(t => (
                  <span key={t} className="tag-pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Usefulness fields */}
          {entry.what_it_is && (
            <div className="entry-section">
              <div className="entry-section-header"><Lightbulb size={14} /> What it is</div>
              <p className="entry-prose-text">{entry.what_it_is}</p>
            </div>
          )}

          {entry.why_useful && (
            <div className="entry-section">
              <div className="entry-section-header"><Zap size={14} /> Why it&apos;s useful</div>
              <p className="entry-prose-text">{entry.why_useful}</p>
            </div>
          )}

          {entry.who_can_use && (
            <div className="entry-section">
              <div className="entry-section-header"><Users size={14} /> Who can use it</div>
              <p className="entry-prose-text">{entry.who_can_use}</p>
            </div>
          )}

          {entry.when_to_use && (
            <div className="entry-section">
              <div className="entry-section-header"><Clock size={14} /> When to use it</div>
              <p className="entry-prose-text">{entry.when_to_use}</p>
            </div>
          )}

          {entry.how_to_use && (
            <div className="entry-section">
              <div className="entry-section-header"><BookOpen size={14} /> How to use it</div>
              <div className="entry-prose-text how-to-steps">
                {entry.how_to_use.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: 0 }}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {entry.example && (
            <div className="entry-section">
              <div className="entry-section-header"><Terminal size={14} /> Example</div>
              <p className="entry-prose-text">{entry.example}</p>
            </div>
          )}

          {/* Command snippet */}
          {entry.command_snippet && (
            <div className="entry-section">
              <div className="entry-section-header" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Terminal size={14} />
                  Command / Snippet
                </div>
                <button
                  id="btn-copy-command"
                  className={`btn btn-sm ${copied ? "btn-secondary" : "btn-primary"}`}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="code-block">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {entry.command_snippet}
                </pre>
              </div>
            </div>
          )}

          {/* Images */}
          {entry.images && entry.images.length > 0 && (
            <div className="entry-section">
              <div className="entry-section-header">
                <Download size={14} />
                Screenshots
              </div>
              <div className="entry-images">
                {entry.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`Screenshot ${i + 1}`}
                    className="entry-image"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {entry.links && entry.links.length > 0 && (
            <div className="entry-section">
              <div className="entry-section-header">
                <Globe size={14} />
                Links
              </div>
              <div className="entry-links">
                {entry.links.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="entry-link-item"
                  >
                    <div className="entry-link-info">
                      <div className="entry-link-label">
                        {link.label ?? link.platform}
                        {link.verified
                          ? <span className="badge badge-green" style={{ fontSize: 10 }}><Shield size={10} /> Verified</span>
                          : <span className="badge badge-orange" style={{ fontSize: 10 }}>⚠ Check</span>
                        }
                      </div>
                      <div className="entry-link-url">{link.url}</div>
                    </div>
                    <ExternalLink size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="entry-detail-sidebar">
          <div className="entry-sidebar-card">
            <div className="entry-sidebar-title">Category</div>
            <div className="entry-sidebar-value">
              {entry.category ? (
                <span>
                  {entry.category.icon} {entry.category.name}
                </span>
              ) : "Uncategorized"}
            </div>
          </div>
          <div className="entry-sidebar-card">
            <div className="entry-sidebar-title">Type</div>
            <span className={`badge ${typeColor}`}>{entry.type}</span>
          </div>
          {entry.difficulty && (
            <div className="entry-sidebar-card">
              <div className="entry-sidebar-title">Difficulty</div>
              <div className="entry-sidebar-value">{entry.difficulty}</div>
            </div>
          )}
          {entry.platform && (
            <div className="entry-sidebar-card">
              <div className="entry-sidebar-title">Platform</div>
              <div className="entry-sidebar-value">{entry.platform}</div>
            </div>
          )}
          <div className="entry-sidebar-card">
            <div className="entry-sidebar-title">Created</div>
            <div className="entry-sidebar-value" style={{ fontSize: 12 }}>{formatDate(entry.created_at)}</div>
          </div>
          <div className="entry-sidebar-card">
            <div className="entry-sidebar-title">Last updated</div>
            <div className="entry-sidebar-value" style={{ fontSize: 12 }}>{formatRelativeDate(entry.updated_at)}</div>
          </div>
        </aside>
      </div>

      <style>{`
        .entry-detail {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .entry-detail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 32px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          gap: 12px;
          flex-wrap: wrap;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .entry-detail-nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .entry-detail-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .entry-detail-body {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 0;
          flex: 1;
        }

        .entry-detail-main {
          padding: 32px;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .entry-detail-title-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .entry-detail-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .entry-detail-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          line-height: 1.3;
        }

        .entry-detail-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .entry-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .entry-section-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .entry-prose-text {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.75;
        }

        .how-to-steps {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .entry-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .entry-image {
          border-radius: var(--radius-md);
          border: 1px solid var(--border-card);
          cursor: pointer;
          transition: transform 0.2s ease;
          max-width: 100%;
        }

        .entry-image:hover {
          transform: scale(1.02);
        }

        .entry-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .entry-link-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .entry-link-item:hover {
          border-color: var(--border-default);
          background: var(--bg-card-hover);
        }

        .entry-link-info {
          flex: 1;
          min-width: 0;
        }

        .entry-link-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .entry-link-url {
          font-size: 11px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entry-detail-sidebar {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .entry-sidebar-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }

        .entry-sidebar-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .entry-sidebar-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .entry-detail-body {
            grid-template-columns: 1fr;
          }
          .entry-detail-main {
            border-right: none;
            padding: 20px 16px;
          }
          .entry-detail-sidebar {
            border-top: 1px solid var(--border-subtle);
          }
          .entry-detail-header {
            padding: 12px 16px;
          }
          .entry-detail-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
