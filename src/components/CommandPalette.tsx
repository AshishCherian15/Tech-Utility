"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Star, FolderOpen, Trash2, Settings, ArrowRight, Command, X } from "lucide-react";
import type { Entry } from "@/lib/types";

interface CommandPaletteProps {
  entries: Entry[];
}

const STATIC_ACTIONS = [
  { id: "new-entry",    label: "New Entry",        icon: Plus,       href: "/entries/new",  group: "Actions" },
  { id: "dashboard",   label: "Go to Dashboard",   icon: Command,    href: "/dashboard",    group: "Navigation" },
  { id: "favorites",   label: "Go to Favorites",   icon: Star,       href: "/favorites",    group: "Navigation" },
  { id: "categories",  label: "Manage Categories", icon: FolderOpen, href: "/categories",   group: "Navigation" },
  { id: "trash",       label: "View Trash",         icon: Trash2,     href: "/trash",        group: "Navigation" },
  { id: "settings",    label: "Open Settings",      icon: Settings,   href: "/settings",     group: "Navigation" },
];

export default function CommandPalette({ entries }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // Ctrl+K / Cmd+K to open, N for new entry
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
          setQuery("");
          setSelected(0);
          setOpen(true);
        }
      }
      if (open && e.key === "Escape") setOpen(false);
      // N for new entry (when not in an input)
      if (!open && e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea" && activeTag !== "select") {
          e.preventDefault();
          router.push("/entries/new");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, router]);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(timeout);
    }

    previouslyFocusedRef.current?.focus();
    previouslyFocusedRef.current = null;
  }, [open]);

  const entryResults = query.trim()
    ? entries
        .filter(e =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
          e.type.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const actionResults = STATIC_ACTIONS.filter(a =>
    !query.trim() || a.label.toLowerCase().includes(query.toLowerCase())
  );

  const allResults: Array<{ id: string; label: string; href: string; group: string; icon?: React.ComponentType<{ size: number }> }> = [
    ...entryResults.map(e => ({ id: e.id, label: e.title, href: `/entries/${e.id}`, group: "Entries" })),
    ...actionResults,
  ];

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && allResults[selected]) {
      handleSelect(allResults[selected].href);
    }
  };

  const handleTabTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  const groupRendered: Record<string, boolean> = {};

  return (
    <>
      <div className="palette-overlay" onClick={() => setOpen(false)} />
      <div ref={dialogRef} className="palette" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={handleTabTrap}>
        <div className="palette-search">
          <Search size={16} aria-hidden="true" style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="palette-input"
            aria-label="Search entries or commands"
            placeholder="Search entries or type a command…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKey}
            autoComplete="off"
          />
          <kbd className="palette-esc">Esc</kbd>
          <button
            type="button"
            className="palette-close"
            onClick={() => setOpen(false)}
            aria-label="Close command palette"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="palette-results" aria-live="polite">
          {allResults.length === 0 ? (
            <div className="palette-empty">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            allResults.map((item, i) => {
              const showGroup = !groupRendered[item.group];
              if (showGroup) groupRendered[item.group] = true;
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {showGroup && (
                    <div className="palette-group-label">{item.group}</div>
                  )}
                  <button
                    type="button"
                    className={`palette-item ${i === selected ? "palette-item-active" : ""}`}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span className="palette-item-icon">
                      {Icon ? <Icon size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
                    </span>
                    <span className="palette-item-label">{item.label}</span>
                    {i === selected && (
                      <span className="palette-item-hint">Enter ↵</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="palette-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
          <span><kbd>Ctrl K</kbd> toggle</span>
          <span><kbd>N</kbd> new entry</span>
        </div>
      </div>

      <style>{`
        .palette-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fade-in 0.15s ease;
        }

        .palette {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          max-width: calc(100vw - 32px);
          background: rgba(10, 15, 28, 0.97);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1);
          z-index: 1001;
          overflow: hidden;
          animation: palette-in 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes palette-in {
          from { opacity: 0; transform: translateX(-50%) scale(0.96) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .palette-overlay,
          .palette {
            animation: none;
          }
        }

        .palette-search {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .palette-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .palette-close:hover {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
        }

        .palette-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--text-primary);
          font-family: inherit;
        }

        .palette-input::placeholder { color: var(--text-muted); }

        .palette-esc {
          font-size: 11px;
          color: var(--text-muted);
          padding: 3px 7px;
          background: rgba(255,255,255,0.06);
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .palette-results {
          max-height: 380px;
          overflow-y: auto;
          padding: 8px 0;
        }

        .palette-group-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          padding: 8px 20px 4px;
        }

        .palette-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }

        .palette-item:hover, .palette-item-active {
          background: rgba(59,130,246,0.1);
        }

        .palette-item-icon {
          color: var(--text-muted);
          display: flex;
          flex-shrink: 0;
        }

        .palette-item-active .palette-item-icon {
          color: var(--brand-blue-bright);
        }

        .palette-item-label {
          font-size: 14px;
          color: var(--text-primary);
          flex: 1;
        }

        .palette-item-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        .palette-empty {
          padding: 32px 20px;
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
        }

        .palette-footer {
          display: flex;
          gap: 16px;
          padding: 10px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 11px;
          color: var(--text-muted);
        }

        .palette-footer kbd {
          font-size: 10px;
          padding: 2px 5px;
          background: rgba(255,255,255,0.07);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          margin-right: 3px;
        }
      `}</style>
    </>
  );
}
