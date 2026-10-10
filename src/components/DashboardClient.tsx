"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search, Plus, Grid3X3, List, Table, Image as ImageIcon, LayoutGrid,
  Pin, SlidersHorizontal, X, Lightbulb, Terminal, Wrench, BookOpen
} from "lucide-react";
import type { Entry, Category, ViewMode, SortOption, EntryType, DifficultyLevel, Platform, PricingTier } from "@/lib/types";
import EntryCard from "@/components/EntryCard";
import EntryCardSkeleton from "@/components/EntryCardSkeleton";
import EntryListItem from "@/components/EntryListItem";
import { cn } from "@/lib/utils";
import { useImageUrls } from "@/lib/use-image-urls";
import { useToast } from "@/components/Toast";

interface DashboardClientProps {
  initialEntries: Entry[];
  totalEntries?: number;
  categories: Category[];
  scope?: "library" | "mine";
  pageTitle?: string;
  emptyMessage?: string;
  initialCategoryId?: string;
  initialSort?: SortOption;
}

const ENTRY_TYPES: EntryType[] = ["Tip", "Trick", "Hack", "App", "Website", "Tool", "Extension", "Command", "Guide", "Prompt"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];
const PLATFORMS: Platform[] = ["Windows", "Android", "iOS", "macOS", "Linux", "Web", "Cross-platform"];
const PRICING_TIERS: PricingTier[] = ["free", "freemium", "paid"];

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

function GalleryCard({ entry, index }: { entry: Entry; index: number }) {
  const imageUrls = useImageUrls(entry.images ?? []);

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="gallery-card animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="gallery-card-img">
        {imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrls[0]} alt={entry.title} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
  );
}

export default function DashboardClient({
  initialEntries,
  totalEntries: initialTotalEntries,
  categories,
  scope = "library",
  pageTitle,
  emptyMessage,
  initialCategoryId = "",
  initialSort = "newest",
}: DashboardClientProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [nextOffset, setNextOffset] = useState(initialEntries.length);
  const [totalEntries, setTotalEntries] = useState(initialTotalEntries ?? initialEntries.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [filterCategory, setFilterCategory] = useState<string>(initialCategoryId);
  const [filterType, setFilterType] = useState<EntryType | "">("");
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | "">("");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "">("");
  const [filterPricing, setFilterPricing] = useState<PricingTier | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const { error: toastError } = useToast();

  const activeFilterCount = [filterCategory, filterType, filterDifficulty, filterPlatform, filterPricing].filter(Boolean).length;
  const hasQuery = search.trim().length > 0;
  const hasActiveCriteria = hasQuery || activeFilterCount > 0;

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
    if (filterPricing) result = result.filter(e => e.pricing === filterPricing);

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
  }, [entries, search, filterCategory, filterType, filterDifficulty, filterPlatform, filterPricing, sort]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterCategory("");
    setFilterType("");
    setFilterDifficulty("");
    setFilterPlatform("");
    setFilterPricing("");
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        scope,
        limit: "100",
        offset: nextOffset.toString(),
      });
      if (filterCategory) params.set("category_id", filterCategory);
      if (filterType) params.set("type", filterType);
      if (filterDifficulty) params.set("difficulty", filterDifficulty);
      if (filterPlatform) params.set("platform", filterPlatform);
      if (filterPricing) params.set("pricing", filterPricing);
      
      const response = await fetch(`/api/entries?${params.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load more entries");
      const loadedIds = new Set(entries.map((entry) => entry.id));
      const nextEntries = (result.entries ?? []) as Entry[];
      setEntries((current) => [
        ...current,
        ...nextEntries.filter((entry) => !loadedIds.has(entry.id)),
      ]);
      setNextOffset((offset) => offset + nextEntries.length);
      setTotalEntries(result.total ?? totalEntries);
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Could not load more entries");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Hero / Search */}
      <section className="dashboard-hero circuit-bg">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-heading">
            <div>
              <span className="dashboard-eyebrow">YOUR PERSONAL TECH LIBRARY</span>
              <h1 className="dashboard-hero-title">
                {pageTitle ?? "Your Tech Memory"}
              </h1>
              <p className="dashboard-hero-sub">
                {entries.length < totalEntries
                  ? `Showing ${entries.length} of ${totalEntries} entries · load more to search older entries`
                  : `${totalEntries} ${totalEntries === 1 ? "entry" : "entries"} saved · search to find anything instantly`}
              </p>
            </div>
            <Link href="/entries/new" className="btn btn-primary dashboard-new-entry">
              <Plus size={17} aria-hidden="true" />
              New entry
            </Link>
          </div>

          {/* Search pill */}
          <div className="search-pill dashboard-search">
            <Search size={18} aria-hidden="true" style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              id="main-search"
              type="text"
              aria-label="Search saved entries"
              placeholder="Search by title, tag, command, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{ padding: 4 }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="search-shortcut"
              aria-label="Open command palette"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
            >
              <kbd style={{ fontSize: 11, color: "var(--text-muted)", padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 4, border: "1px solid var(--border-subtle)", whiteSpace: "nowrap" }}>
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Category chips */}
          {totalEntries > 0 && (
            <div className="dashboard-category-chips" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={cn("category-chip", !filterCategory && "category-chip-active")}
                onClick={() => setFilterCategory("")}
                aria-pressed={!filterCategory}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={cn("category-chip", filterCategory === cat.id && "category-chip-active")}
                  onClick={() => setFilterCategory(filterCategory === cat.id ? "" : cat.id)}
                  aria-pressed={filterCategory === cat.id}
                  style={filterCategory === cat.id ? { borderColor: cat.color } : {}}
                >
                  <span aria-hidden="true" style={{ fontSize: 14 }}>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toolbar */}
      {totalEntries > 0 && (
        <div className="dashboard-toolbar">
        <div className="dashboard-toolbar-left">
          <span className="dashboard-count" role="status" aria-live="polite" aria-atomic="true">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            {entries.length < totalEntries && <> · showing {entries.length} of {totalEntries}</>}
            {hasQuery && <> for &ldquo;<strong>{search.trim()}</strong>&rdquo;</>}
          </span>

          <button
            type="button"
            className={cn("btn btn-secondary btn-sm", showFilters && "btn-primary")}
            onClick={() => setShowFilters(!showFilters)}
            id="btn-toggle-filters"
            aria-expanded={showFilters}
            aria-controls={showFilters ? "dashboard-filters" : undefined}
            aria-label={`Filters${activeFilterCount ? `, ${activeFilterCount} active` : ""}`}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
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
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={12} aria-hidden="true" />
              Clear
            </button>
          )}
        </div>

        <div className="dashboard-toolbar-right">
          {/* Sort */}
          <select
            className="input"
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
            aria-label="Sort entries"
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="recently_edited">Recently Edited</option>
            <option value="favorites">Favorites First</option>
            <option value="alphabetical">A → Z</option>
          </select>

          {/* View switcher */}
          <div className="view-switcher" role="group" aria-label="Entry layout">
            {[
              { mode: "grid" as ViewMode, icon: Grid3X3 },
              { mode: "list" as ViewMode, icon: List },
              { mode: "table" as ViewMode, icon: Table },
              { mode: "gallery" as ViewMode, icon: ImageIcon },
              { mode: "masonry" as ViewMode, icon: LayoutGrid },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                className={cn("view-btn", view === mode && "view-btn-active")}
                onClick={() => setView(mode)}
                data-tooltip={mode.charAt(0).toUpperCase() + mode.slice(1)}
                aria-label={`${mode} view`}
                aria-pressed={view === mode}
              >
                <Icon size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div id="dashboard-filters" className="filters-panel animate-fade-in" role="region" aria-label="Entry filters">
          <div className="filters-group">
            <span className="filters-label" id="filter-type-label">Type</span>
            <div className="filters-chips" role="group" aria-labelledby="filter-type-label">
              {ENTRY_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={cn("filter-chip", filterType === t && "filter-chip-active")}
                  onClick={() => setFilterType(filterType === t ? "" : t)}
                  aria-pressed={filterType === t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="filters-group">
            <span className="filters-label" id="filter-difficulty-label">Difficulty</span>
            <div className="filters-chips" role="group" aria-labelledby="filter-difficulty-label">
              {DIFFICULTY_LEVELS.map(d => (
                <button
                  key={d}
                  type="button"
                  className={cn("filter-chip", filterDifficulty === d && "filter-chip-active")}
                  onClick={() => setFilterDifficulty(filterDifficulty === d ? "" : d)}
                  aria-pressed={filterDifficulty === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="filters-group">
            <span className="filters-label" id="filter-platform-label">Platform</span>
            <div className="filters-chips" role="group" aria-labelledby="filter-platform-label">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={cn("filter-chip", filterPlatform === p && "filter-chip-active")}
                  onClick={() => setFilterPlatform(filterPlatform === p ? "" : p)}
                  aria-pressed={filterPlatform === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="filters-group">
            <span className="filters-label" id="filter-pricing-label">Pricing</span>
            <div className="filters-chips" role="group" aria-labelledby="filter-pricing-label">
              {PRICING_TIERS.map(p => (
                <button
                  key={p}
                  type="button"
                  className={cn("filter-chip", filterPricing === p && "filter-chip-active")}
                  onClick={() => setFilterPricing(filterPricing === p ? "" : p)}
                  aria-pressed={filterPricing === p}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Entry grid/list */}
      <div className="dashboard-entries">
        {filtered.length === 0 ? (
          <div className={cn("empty-state", !hasActiveCriteria && "empty-state-first-run")}>
            <div className="empty-state-icon">
              {hasActiveCriteria
                ? <Search size={40} aria-hidden="true" />
                : <Plus size={40} aria-hidden="true" />}
            </div>
            <h2 className="empty-state-title">
              {hasActiveCriteria
                ? hasQuery ? `No results for "${search.trim()}"` : "No entries match these filters"
                : emptyMessage ? "Nothing here yet" : "No entries yet"}
            </h2>
            <p className="empty-state-desc">
              {hasActiveCriteria
                ? "Try another search or clear your search and filters"
                : emptyMessage ?? "Add your first tech tip, command, app, or discovery"}
            </p>
            {hasActiveCriteria && (
              <button type="button" className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: 16 }}>
                Clear search and filters
              </button>
            )}
            {!hasActiveCriteria && (
              <>
                <Link href="/entries/new" className="btn btn-primary" style={{ marginTop: 16 }}>
                  <Plus size={16} aria-hidden="true" />
                  Add Your First Entry
                </Link>
                <div className="quick-entry-start">
                  <span className="quick-entry-label">Choose a quick start</span>
                  <div className="quick-entry-grid">
                    {([
                      { type: "Tip" as EntryType, label: "Save a tip", icon: Lightbulb },
                      { type: "Command" as EntryType, label: "Save a command", icon: Terminal },
                      { type: "Tool" as EntryType, label: "Save a tool", icon: Wrench },
                      { type: "Guide" as EntryType, label: "Write a guide", icon: BookOpen },
                    ]).map(({ type, label, icon: Icon }) => (
                      <Link
                        key={type}
                        href={`/entries/new?type=${type}`}
                        className="quick-entry-link"
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
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
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <EntryCardSkeleton key={`skeleton-${i}`} />
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
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                style={{
                  padding: "12px 16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  borderRadius: 8,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "var(--bg-muted)",
                    flexShrink: 0,
                  }}
                  className="shimmer"
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      width: "60%",
                      height: 16,
                      borderRadius: 4,
                      background: "var(--bg-muted)",
                    }}
                    className="shimmer"
                  />
                  <div
                    style={{
                      width: "40%",
                      height: 12,
                      borderRadius: 4,
                      background: "var(--bg-muted)",
                    }}
                    className="shimmer"
                  />
                </div>
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
                {loadingMore && Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td>
                      <div
                        style={{
                          width: "60%",
                          height: 14,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          width: 40,
                          height: 18,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          width: 50,
                          height: 14,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <div
                          style={{
                            width: 30,
                            height: 14,
                            borderRadius: 4,
                            background: "var(--bg-muted)",
                          }}
                          className="shimmer"
                        />
                        <div
                          style={{
                            width: 30,
                            height: 14,
                            borderRadius: 4,
                            background: "var(--bg-muted)",
                          }}
                          className="shimmer"
                        />
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          width: 40,
                          height: 14,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          width: 40,
                          height: 14,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                    <td>
                      <div
                        style={{
                          width: 60,
                          height: 12,
                          borderRadius: 4,
                          background: "var(--bg-muted)",
                        }}
                        className="shimmer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === "masonry" ? (
          /* Masonry view */
          <div className="entry-masonry">
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className="masonry-item animate-fade-in"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <EntryCard entry={entry} typeColorClass={TYPE_COLORS[entry.type]} />
              </div>
            ))}
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="masonry-item">
                <EntryCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          /* Gallery view */
          <div className="gallery-grid">
            {filtered.map((entry, i) => (
              <GalleryCard key={entry.id} entry={entry} index={i} />
            ))}
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="gallery-item">
                <EntryCardSkeleton />
              </div>
            ))}
          </div>
        )}
      </div>

      {entries.length < totalEntries && (
        <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 32px" }}>
          <button type="button" className="btn btn-secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : `Load more (${totalEntries - entries.length} remaining)`}
          </button>
        </div>
      )}

      <style>{`
        .dashboard {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-hero {
          padding: 36px 32px 28px;
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
          max-width: 980px;
          position: relative;
        }

        .dashboard-hero-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .dashboard-eyebrow {
          display: inline-block;
          color: var(--brand-blue-bright);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          margin-bottom: 8px;
        }

        .dashboard-hero-title {
          font-size: clamp(28px, 4vw, 38px);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.04em;
          line-height: 1.12;
          margin-bottom: 8px;
        }

        .dashboard-hero-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        .dashboard-new-entry {
          flex-shrink: 0;
          min-height: 46px;
          padding-inline: 18px;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.24);
        }

        .dashboard-search {
          max-width: 600px;
          margin-bottom: 20px;
        }

        .search-shortcut {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          padding: 0;
          border: 0;
          border-radius: var(--radius-sm);
          background: transparent;
          cursor: pointer;
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
          min-height: 44px;
          padding: 8px 14px;
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
          min-width: 44px;
          min-height: 44px;
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
          min-height: 44px;
          padding: 8px 12px;
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

        .quick-entry-start {
          width: min(100%, 620px);
          margin-top: 28px;
        }

        .quick-entry-label {
          display: block;
          margin-bottom: 10px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .quick-entry-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-entry-link {
          display: flex;
          min-height: 76px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 8px;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-md);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
        }

        .quick-entry-link svg {
          color: var(--brand-blue-bright);
        }

        .quick-entry-link:hover {
          transform: translateY(-2px);
          background: var(--bg-card-hover);
          border-color: var(--border-default);
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

          .dashboard-hero-heading {
            align-items: flex-start;
            gap: 14px;
          }

          .dashboard-hero-title {
            font-size: 28px;
          }

          .dashboard-new-entry {
            min-height: 44px;
            padding-inline: 12px;
          }

          .dashboard-toolbar {
            padding: 10px 16px;
          }

          .dashboard-entries {
            padding: 16px;
          }

          .quick-entry-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .dashboard-hero-heading {
            flex-direction: column;
          }

          .dashboard-toolbar-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
