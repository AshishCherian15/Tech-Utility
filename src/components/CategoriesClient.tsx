"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FolderOpen, X, Check, Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface CategoriesClientProps {
  initialCategories: Category[];
}

const PRESET_COLORS = [
  "#3b82f6","#8b5cf6","#22c55e","#f97316",
  "#ec4899","#eab308","#14b8a6","#ef4444",
  "#06b6d4","#a855f7",
];

const PRESET_ICONS = [
  "💻","📱","🌐","🛠️","⚡","🔒","🤖","📂","🎯","📝",
  "🔧","🚀","💡","🎨","📊","🔍","🖥️","📡","🧩","⌨️",
];

const DEFAULT_FORM = { name: "", description: "", icon: "📂", color: "#3b82f6" };

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const startAdd = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description ?? "", icon: cat.icon, color: cat.color });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const { data } = await supabase
          .from("categories")
          .update({ name: form.name, description: form.description, icon: form.icon, color: form.color })
          .eq("id", editId)
          .select()
          .single();
        if (data) setCategories(prev => prev.map(c => c.id === editId ? data : c));
      } else {
        const { data } = await supabase
          .from("categories")
          .insert({ name: form.name, description: form.description, icon: form.icon, color: form.color })
          .select()
          .single();
        if (data) setCategories(prev => [...prev, data]);
      }
      setShowForm(false);
      setForm(DEFAULT_FORM);
      setEditId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Its entries will move to Uncategorized.`)) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-sub">{categories.length} categories · organize your entries</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd} id="btn-add-category">
          <Plus size={16} />
          New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="category-form-wrap animate-fade-in">
          <div className="category-form">
            <div className="category-form-header">
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                {editId ? "Edit Category" : "New Category"}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="form-grid">
              {/* Name */}
              <div className="form-field form-field-wide">
                <label className="form-label">Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Windows, Android, AI Tools…"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  id="cat-name-input"
                />
              </div>
              <div className="form-field form-field-wide">
                <label className="form-label">Description</label>
                <input
                  className="input"
                  placeholder="Short description (optional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Icon */}
              <div className="form-field">
                <label className="form-label">Icon (emoji)</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-btn ${form.icon === icon ? "icon-btn-active" : ""}`}
                      onClick={() => setForm(f => ({ ...f, icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  className="input"
                  placeholder="Or type any emoji"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  style={{ marginTop: 8, width: 80 }}
                />
              </div>

              {/* Color */}
              <div className="form-field">
                <label className="form-label">Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className="color-dot"
                      style={{
                        background: color,
                        borderColor: form.color === color ? "#fff" : "transparent",
                        boxShadow: form.color === color ? `0 0 0 2px ${color}` : "none",
                      }}
                      onClick={() => setForm(f => ({ ...f, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                id="btn-save-category"
              >
                {saving ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Check size={14} />}
                {saving ? "Saving…" : editId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FolderOpen size={40} /></div>
            <h2 className="empty-state-title">No categories yet</h2>
            <p className="empty-state-desc">Create your first category to organize entries</p>
            <button className="btn btn-primary" onClick={startAdd} style={{ marginTop: 16 }}>
              <Plus size={15} />
              Create First Category
            </button>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="category-card animate-fade-in">
              <div className="category-card-top">
                <div className="category-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="category-card-actions">
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => startEdit(cat)}
                    data-tooltip="Edit"
                    aria-label="Edit category"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    data-tooltip="Delete"
                    aria-label="Delete category"
                    style={{ color: "#f87171" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <Link href={`/dashboard?category=${cat.id}`} className="category-name" style={{ color: cat.color }}>
                {cat.name}
              </Link>
              {cat.description && (
                <p className="category-desc">{cat.description}</p>
              )}
              <div className="category-count">
                {cat.entry_count ?? 0} entries
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .categories-page {
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 32px 32px 24px;
          border-bottom: 1px solid var(--border-subtle);
          gap: 16px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .page-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .category-form-wrap {
          padding: 0 32px 24px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .category-form {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 24px;
          max-width: 700px;
        }

        .category-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          padding: 28px 32px;
        }

        .category-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .category-card:hover {
          border-color: var(--border-default);
          box-shadow: var(--shadow-glow);
          transform: translateY(-1px);
        }

        .category-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .category-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .category-card-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .category-card:hover .category-card-actions {
          opacity: 1;
        }

        .category-name {
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .category-name:hover { opacity: 0.8; }

        .category-desc {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .category-count {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .icon-btn:hover, .icon-btn-active {
          border-color: var(--brand-blue);
          background: rgba(59,130,246,0.1);
        }

        @media (max-width: 768px) {
          .page-header, .categories-grid, .category-form-wrap {
            padding-left: 16px;
            padding-right: 16px;
          }
          .page-header {
            padding-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}
