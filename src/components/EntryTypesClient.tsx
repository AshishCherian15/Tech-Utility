"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Save, X, Terminal, Monitor, Globe, Puzzle, Code, Workflow, Book, Wrench, Tag, AlertTriangle } from "lucide-react";
import type { EntryTypeConfig } from "@/lib/types";
import { useToast } from "@/components/Toast";

const ICON_OPTIONS = [
  { value: "tag", icon: Tag, label: "Tag" },
  { value: "terminal", icon: Terminal, label: "Terminal" },
  { value: "monitor", icon: Monitor, label: "Monitor" },
  { value: "globe", icon: Globe, label: "Globe" },
  { value: "puzzle", icon: Puzzle, label: "Puzzle" },
  { value: "code", icon: Code, label: "Code" },
  { value: "workflow", icon: Workflow, label: "Workflow" },
  { value: "book", icon: Book, label: "Book" },
  { value: "wrench", icon: Wrench, label: "Wrench" },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
  { value: "cyan", label: "Cyan" },
  { value: "yellow", label: "Yellow" },
  { value: "gray", label: "Gray" },
];

interface EntryTypesClientProps {
  entryTypes: EntryTypeConfig[];
}

export default function EntryTypesClient({ entryTypes: initialEntryTypes }: EntryTypesClientProps) {
  const [entryTypes, setEntryTypes] = useState<EntryTypeConfig[]>(initialEntryTypes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState<Partial<EntryTypeConfig>>({
    name: "",
    description: "",
    icon: "tag",
    color: "blue",
    is_active: true,
    sort_order: entryTypes.length + 1,
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [isFallbackMode] = useState(initialEntryTypes.some(t => t.id.startsWith('default-')));
  const { success, error: showError } = useToast();

  const supabase = createClient();

  const handleSave = async (id: string, updates: Partial<EntryTypeConfig>) => {
    if (isFallbackMode) {
      showError("Cannot edit types in fallback mode. Run the database migration first.");
      return;
    }

    const { error: dbError } = await supabase
      .from("entry_types")
      .update(updates)
      .eq("id", id);

    if (dbError) {
      showError(dbError.message);
      return;
    }

    setEntryTypes(entryTypes.map((et) => (et.id === id ? { ...et, ...updates } : et)));
    setEditingId(null);
    success("Entry type updated successfully");
  };

  const handleDelete = async (id: string) => {
    if (isFallbackMode) {
      showError("Cannot delete types in fallback mode. Run the database migration first.");
      return;
    }

    if (!confirm("Are you sure you want to delete this entry type? This action cannot be undone.")) {
      return;
    }

    const { error: dbError } = await supabase
      .from("entry_types")
      .delete()
      .eq("id", id);

    if (dbError) {
      showError(dbError.message);
      return;
    }

    setEntryTypes(entryTypes.filter((et) => et.id !== id));
    success("Entry type deleted successfully");
  };

  const handleCreate = async () => {
    if (isFallbackMode) {
      showError("Cannot create types in fallback mode. Run the database migration first.");
      return;
    }

    if (!newType.name || !newType.icon || !newType.color) {
      showError("Name, icon, and color are required");
      return;
    }

    const { data, error: dbError } = await supabase
      .from("entry_types")
      .insert({
        name: newType.name,
        description: newType.description || null,
        icon: newType.icon,
        color: newType.color,
        is_active: true,
        sort_order: entryTypes.length + 1,
      })
      .select()
      .single();

    if (dbError) {
      showError(dbError.message);
      return;
    }

    setEntryTypes([...entryTypes, data]);
    setNewType({
      name: "",
      description: "",
      icon: "tag",
      color: "blue",
      is_active: true,
      sort_order: entryTypes.length + 2,
    });
    setShowNewForm(false);
    success("Entry type created successfully");
  };

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find((opt) => opt.value === iconName);
    if (!option) return Tag;
    return option.icon;
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Entry Types</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage the types of entries that can be created in ByteShelf</p>
        </div>
        {!isFallbackMode && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            <Plus size={16} />
            {showNewForm ? "Cancel" : "New Type"}
          </button>
        )}
      </div>

      {isFallbackMode && (
        <div className="settings-card" style={{ marginBottom: 24, padding: 20, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#f59e0b" }}>Database Migration Required</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
                The entry_types table does not exist in your database. You are currently viewing default fallback types.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 0 }}>
                To enable full type management, run <code style={{ background: "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>database/08-add-entry-types-table.sql</code> in your Supabase SQL Editor. Don&apos;t forget to refresh the PostgREST schema with <code style={{ background: "rgba(0,0,0,0.1)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>NOTIFY pgrst, &apos;reload schema&apos;;</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {showNewForm && (
        <div className="settings-card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create New Entry Type</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Name</label>
              <input
                type="text"
                className="input"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                placeholder="e.g., Tutorial"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Sort Order</label>
              <input
                type="number"
                className="input"
                value={newType.sort_order}
                onChange={(e) => setNewType({ ...newType, sort_order: parseInt(e.target.value) || 0 })}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Description</label>
            <input
              type="text"
              className="input"
              value={newType.description || ""}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              placeholder="e.g., Step-by-step tutorials and guides"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Icon</label>
              <select
                className="input"
                value={newType.icon}
                onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                style={{ width: "100%" }}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Color</label>
              <select
                className="input"
                value={newType.color}
                onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                style={{ width: "100%" }}
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={handleCreate}>
              <Save size={14} />
              Create Type
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowNewForm(false)}>
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="settings-card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Icon</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Name</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Description</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Color</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Sort</th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Active</th>
              <th style={{ textAlign: "right", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entryTypes.map((entryType) => {
              const IconComponent = getIconComponent(entryType.icon);
              const isEditing = editingId === entryType.id;

              return (
                <tr key={entryType.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `var(--color-${entryType.color}, rgba(59,130,246,0.1))`, color: `var(--color-${entryType.color}, var(--brand-blue-bright))`, display: "grid", placeItems: "center" }}>
                        <IconComponent size={16} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        defaultValue={entryType.name}
                        onBlur={(e) => {
                          if (isFallbackMode) {
                            showError("Cannot edit types in fallback mode. Run the database migration first.");
                            setEditingId(null);
                            return;
                          }
                          handleSave(entryType.id, { name: e.currentTarget.value });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (isFallbackMode) {
                              showError("Cannot edit types in fallback mode. Run the database migration first.");
                              setEditingId(null);
                              return;
                            }
                            handleSave(entryType.id, { name: e.currentTarget.value });
                          }
                        }}
                        style={{ width: 120 }}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{entryType.name}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 14 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        defaultValue={entryType.description || ""}
                        onBlur={(e) => handleSave(entryType.id, { description: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSave(entryType.id, { description: e.currentTarget.value });
                          }
                        }}
                        style={{ width: 200 }}
                      />
                    ) : (
                      entryType.description || "—"
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <select
                        className="input"
                        defaultValue={entryType.color}
                        onChange={(e) => handleSave(entryType.id, { color: e.target.value })}
                        style={{ width: 100 }}
                      >
                        {COLOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: 13, textTransform: "capitalize" }}>{entryType.color}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="input"
                        defaultValue={entryType.sort_order}
                        onBlur={(e) => handleSave(entryType.id, { sort_order: parseInt(e.target.value) || 0 })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSave(entryType.id, { sort_order: parseInt(e.currentTarget.value) || 0 });
                          }
                        }}
                        style={{ width: 60 }}
                      />
                    ) : (
                      <span>{entryType.sort_order}</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => handleSave(entryType.id, { is_active: !entryType.is_active })}
                      style={{
                        background: entryType.is_active ? "rgba(34,197,94,0.1)" : "rgba(156,163,175,0.1)",
                        color: entryType.is_active ? "#22c55e" : "#9ca3af",
                        border: entryType.is_active ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(156,163,175,0.2)",
                      }}
                    >
                      {entryType.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingId(isEditing ? null : entryType.id)}
                        title="Edit"
                      >
                        {isEditing ? <X size={14} /> : <Edit2 size={14} />}
                      </button>
                      {!isFallbackMode && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(entryType.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
