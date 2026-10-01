"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Grid3X3, List, Table, Image as ImageIcon,
  Star, Pin, SlidersHorizontal, X, Filter
} from "lucide-react";
import type { Entry, Category, ViewMode, SortOption, EntryType, DifficultyLevel, Platform } from "@/lib/types";
import EntryCard from "@/components/EntryCard";
import EntryListItem from "@/components/EntryListItem";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  initialEntries: Entry[];
  categories: Category[];
  pageTitle?: string;
  emptyMessage?: string;
}

const ENTRY_TYPES: EntryType[] = ["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];
const PLATFORMS: Platform[] = ["Windows", "Android", "iOS", "macOS", "Linux", "Web", "Cross-platform"];

const TYPE_COLORS: Record<EntryType, string> = {
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

export default function DashboardClient({ initialEntries, categories, pageTitle, emptyMessage }: DashboardClientProps) {
  const [entries] = useState<Entry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<EntryType | "">("");
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | "">("");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [filterCategory, filterType, filterDifficulty, filterPlatform].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q)) ||
        e.command_snippet?.toLowerCase().includes(q) ||
        e.what_it_is?.toLowerCase().includes(q) ||
        e.category?.name.toLowerCase().includes(q)
      );
    }

    if (filterCategory) result = result.filter(e => e.category_id === filterCategory);
    if (filterType) result = result.filter(e => e.type === filterType);
    if (filterDifficulty) result = result.filter(e => e.difficulty === filterDifficulty);
    if (filterPlatform) result = result.filter(e => e.platform === filterPlatform);

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "recently_edited": return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "favorites": return (b.favorited ? 1 : 0) - (a.favorited ? 1 : 0);
        case "alphabetical": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    // Pinned always first
    const pinned = result.filter(e => e.pinned);
    const rest = result.filter(e => !e.pinned);
    return [...pinned, ...rest];
  }, [entries, search, filterCategory, filterType, filterDifficulty, filterPlatform, sort]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterCategory("");
    setFilterType("");
    setFilterDifficulty("");
    setFilterPlatform("");
  }, []);

  return (
    <div className="dashboard">
      {/* Hero / Search */}
      <section className="dashboard-hero circuit-bg">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-hero-title">
            {pageTitle ?? "Your Tech Memory"}
          </h1>
          <p className="dashboard-hero-sub">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} saved · search to find anything instantly
          </p>

          {/* Search pill */}
          <div className="search-pill dashboard-search" onClick={() => document.getElementById("main-search")?.focus()}>
            <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              id="main-search"
              type="text"
              placeholder="Search by title, tag, command, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setSearch("")}
                style={{ padding: 4 }}
              >
                <X size={14} />
              </button>
            )}
            <kbd
              style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 4, border: "1px solid var(--border-subtle)", whiteSpace: "nowrap", cursor: "pointer" }}
              onClick={e => { e.stopPropagation(); window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })); }}
            >
              Ctrl K
            </kbd>
          </div>

          {/* Category chips */}
          <div className="dashboard-category-chips">
            <button
              className={cn("category-chip", !filterCategory && "category-chip-active")}
              onClick={() => setFilterCategory("")}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={cn("category-chip", filterCategory === cat.id && "category-chip-active")}
                onClick={() => setFilterCategory(filterCategory === cat.id ? "" : cat.id)}
                style={filterCategory === cat.id ? { borderColor: cat.color } : {}}
              >
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <div className="dashboard-toolbar-left">
          <span className="dashboard-count">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            {search && <> for &ldquo;<strong>{search}</strong>&rdquo;</>}
          </span>

          <button
            className={cn("btn btn-secondary btn-sm", showFilters && "btn-primary")}
            onClick={() => setShowFilters(!showFilters)}
            id="btn-toggle-filters"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: "var(--brand-blue)",
                color: "#fff",
                borderRadius: "9999px",
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        <div className="dashboard-toolbar-right">
          {/* Sort */}
          <select
            className="input"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="recently_edited">Recently Edited</option>
            <option value="favorites">Favorites First</option>
            <option value="alphabetical">A → Z</option>
          </select>

          {/* View switcher */}
          <div className="view-switcher">
            {([
              { mode: "grid" as ViewMode, icon: Grid3X3 },
              { mode: "list" as ViewMode, icon: List },
              { mode: "table" as ViewMode, icon: Table },
              { mode: "gallery" as ViewMode, icon: ImageIcon },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                className={cn("view-btn", view === mode && "view-btn-active")}
                onClick={() => setView(mode)}
                data-tooltip={mode.charAt(0).toUpperCase() + mode.slice(1)}
                aria-label={`${mode} view`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filters-panel animate-fade-in">
          <div className="filters-group">
            <label className="filters-label">Type</label>
            <div className="filters-chips">
              {ENTRY_TYPES.map(t => (
                <button
                  key={t}
                  className={cn("filter-chip", filterType === t && "filter-chip-active")}
                  onClick={() => setFilterType(filterType === t ? "" : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="filters-group">
            <label className="filters-label">Difficulty</label>
            <div className="filters-chips">
              {DIFFICULTY_LEVELS.map(d => (
                <button
                  key={d}
                  className={cn("filter-chip", filterDifficulty === d && "filter-chip-active")}
                  onClick={() => setFilterDifficulty(filterDifficulty === d ? "" : d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="filters-group">
            <label className="filters-label">Platform</label>
            <div className="filters-chips">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  className={cn("filter-chip", filterPlatform === p && "filter-chip-active")}
                  onClick={() => setFilterPlatform(filterPlatform === p ? "" : p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entry grid/list */}
      <div className="dashboard-entries">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {search ? <Search size={40} /> : <Plus size={40} />}
            </div>
            <h2 className="empty-state-title">
              {search ? `No results for "${search}"` : emptyMessage ? "Nothing here yet" : "No entries yet"}
            </h2>
            <p className="empty-state-desc">
              {search
                ? "Try a different search term or clear the filters"
                : emptyMessage ?? "Add your first tech tip, command, app, or discovery"}
            </p>
            {!search && (
              <Link href="/entries/new" className="btn btn-primary" style={{ marginTop: 16 }}>
                <Plus size={16} />
                Add Your First Entry
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="entry-grid">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <EntryCard entry={entry} typeColorClass={TYPE_COLORS[entry.type]} />
              </div>
            ))}
          </div>
        ) : view === "list" ? (
          <div className="entry-list">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
              >
                <EntryListItem entry={entry} typeColorClass={TYPE_COLORS[entry.type]} />
              </div>
            ))}
          </div>
        ) : view === "table" ? (
          <div className="entry-table-wrap">
            <table className="entry-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th>Difficulty</th>
                  <th>Platform</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <Link href={`/entries/${entry.id}`} className="entry-table-title">
                        {entry.pinned && <Pin size={11} style={{ color: "var(--brand-blue-bright)" }} />}
                        {entry.title}
                      </Link>
                    </td>
                    <td><span className={`badge ${TYPE_COLORS[entry.type]}`}>{entry.type}</span></td>
                    <td>{entry.category?.name ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {entry.tags?.slice(0, 3).map(t => (
                          <span key={t} className="tag-pill">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>{entry.difficulty ?? "—"}</td>
                    <td>{entry.platform ?? "—"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Gallery view */
          <div className="gallery-grid">
            {filtered.map((entry, i) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="gallery-card animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <div className="gallery-card-img">
                  {entry.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.images[0]} alt={entry.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="gallery-card-placeholder">
                      <span className={`badge ${TYPE_COLORS[entry.type]}`}>{entry.type}</span>
                    </div>
                  )}
                </div>
                <div className="gallery-card-info">
                  <div className="gallery-card-title">{entry.title}</div>
                  <div className="gallery-card-meta">{entry.category?.name}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-hero {
          padding: 48px 32px 36px;
          border-bottom: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
        }

        .dashboard-hero::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .dashboard-hero-content {
          max-width: 700px;
          position: relative;
        }

        .dashboard-hero-title {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .dashboard-hero-sub {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .dashboard-search {
          max-width: 600px;
          margin-bottom: 20px;
        }

        .dashboard-category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          font-size: 13px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .category-chip:hover {
          background: rgba(255,255,255,0.08);
          color: var(--text-primary);
        }

        .category-chip-active {
          background: rgba(59,130,246,0.15);
          border-color: rgba(59,130,246,0.4);
          color: var(--brand-blue-bright);
          font-weight: 500;
        }

        .dashboard-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 32px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          gap: 12px;
          flex-wrap: wrap;
        }

        .dashboard-toolbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .dashboard-toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dashboard-count {
          font-size: 13px;
          color: var(--text-muted);
        }

        .dashboard-count strong {
          color: var(--text-primary);
        }

        .view-switcher {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn {
          padding: 7px 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.06);
        }

        .view-btn-active {
          background: rgba(59,130,246,0.2);
          color: var(--brand-blue-bright);
        }

        .filters-panel {
          padding: 16px 32px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filters-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filters-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          min-width: 64px;
        }

        .filters-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-chip {
          padding: 4px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .filter-chip:hover {
          background: rgba(255,255,255,0.08);
        }

        .filter-chip-active {
          background: rgba(59,130,246,0.2);
          border-color: rgba(59,130,246,0.5);
          color: var(--brand-blue-bright);
          font-weight: 600;
        }

        .dashboard-entries {
          padding: 24px 32px;
          flex: 1;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
          gap: 8px;
        }

        .empty-state-icon {
          width: 80px;
          height: 80px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-blue-bright);
          margin-bottom: 12px;
        }

        .empty-state-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-state-desc {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 360px;
        }

        /* Table view */
        .entry-table-wrap {
          overflow-x: auto;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-card);
        }

        .entry-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .entry-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-card);
        }

        .entry-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }

        .entry-table tbody tr:hover td {
          background: var(--bg-card-hover);
        }

        .entry-table-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .entry-table-title:hover {
          color: var(--brand-blue-bright);
        }

        /* Gallery view */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .gallery-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          text-decoration: none;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          transition: all 0.2s ease;
        }

        .gallery-card:hover {
          border-color: var(--border-default);
          box-shadow: var(--shadow-glow);
          transform: translateY(-2px);
        }

        .gallery-card-img {
          height: 140px;
          background: var(--bg-card-hover);
          overflow: hidden;
        }

        .gallery-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(34,211,238,0.05));
        }

        .gallery-card-info {
          padding: 10px 12px;
        }

        .gallery-card-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gallery-card-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .dashboard-hero {
            padding: 24px 16px 20px;
          }

          .dashboard-hero-title {
            font-size: 24px;
          }

          .dashboard-toolbar {
            padding: 10px 16px;
          }

          .dashboard-entries {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
