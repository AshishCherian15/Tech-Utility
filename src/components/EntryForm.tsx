"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Plus, X, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Category, Entry, EntryType, DifficultyLevel, Platform } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

const ENTRY_TYPES: EntryType[] = ["Tip","Trick","Hack","App","Website","Tool","Extension","Command","Guide","Prompt"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];
const PLATFORMS: Platform[] = ["Windows","Android","iOS","macOS","Linux","Web","Cross-platform"];
const COLORS = [
  { label: "Blue", value: "#blue" },
  { label: "Purple", value: "#purple" },
  { label: "Green", value: "#green" },
  { label: "Orange", value: "#orange" },
  { label: "Pink", value: "#pink" },
  { label: "Yellow", value: "#yellow" },
  { label: "Teal", value: "#teal" },
  { label: "Red", value: "#red" },
];
const COLOR_MAP: Record<string, string> = {
  "#blue": "#3b82f6", "#purple": "#8b5cf6", "#green": "#22c55e",
  "#orange": "#f97316", "#pink": "#ec4899", "#yellow": "#eab308",
  "#teal": "#14b8a6", "#red": "#ef4444",
};

interface EntryFormProps {
  categories: Category[];
  entry?: Entry;
}

export default function EntryForm({ categories, entry }: EntryFormProps) {
  const isEdit = !!entry;
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError, ai: toastAi } = useToast();

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [aiDrafted, setAiDrafted] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: entry?.title ?? "",
    category_id: entry?.category_id ?? "",
    type: (entry?.type ?? "Tip") as EntryType,
    tags: entry?.tags ?? [] as string[],
    what_it_is: entry?.what_it_is ?? "",
    why_useful: entry?.why_useful ?? "",
    who_can_use: entry?.who_can_use ?? "",
    when_to_use: entry?.when_to_use ?? "",
    how_to_use: entry?.how_to_use ?? "",
    example: entry?.example ?? "",
    difficulty: (entry?.difficulty ?? "") as DifficultyLevel | "",
    platform: (entry?.platform ?? "") as Platform | "",
    command_snippet: entry?.command_snippet ?? "",
    images: entry?.images ?? [] as string[],
    color: entry?.color ?? "",
  });

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (t: string) =>
    set("tags", form.tags.filter(x => x !== t));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("entry-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("entry-images").getPublicUrl(path);
        set("images", [...form.images, data.publicUrl]);
      }
    } finally {
      setUploadingImg(false);
    }
  };

  const handleAiAutofill = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    const customKey = typeof window !== "undefined" ? localStorage.getItem("ash_custom_ai_key") || undefined : undefined;
    const customProvider = typeof window !== "undefined" ? localStorage.getItem("ash_ai_provider") || "groq" : "groq";

    try {
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: "text",
          content: aiInput,
          custom_api_key: customKey,
          custom_provider: customProvider,
        }),
      });
      const draft = await res.json();
      if (!res.ok) {
        toastError(draft.error ?? "AI autofill unavailable — fill manually");
      } else {
        setForm(prev => ({
          ...prev,
          title: draft.title ?? prev.title,
          type: draft.type ?? prev.type,
          tags: draft.tags ?? prev.tags,
          what_it_is: draft.what_it_is ?? prev.what_it_is,
          why_useful: draft.why_useful ?? prev.why_useful,
          who_can_use: draft.who_can_use ?? prev.who_can_use,
          when_to_use: draft.when_to_use ?? prev.when_to_use,
          how_to_use: draft.how_to_use ?? prev.how_to_use,
          example: draft.example ?? prev.example,
          difficulty: draft.difficulty ?? prev.difficulty,
          platform: draft.platform ?? prev.platform,
          command_snippet: draft.command_snippet ?? prev.command_snippet,
        }));
        setAiDrafted(true);
        setShowAiPanel(false);
        toastAi("Fields drafted — review everything before saving");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      const payload = {
        ...form,
        category_id: form.category_id || null,
        difficulty: form.difficulty || null,
        platform: form.platform || null,
        color: form.color || null,
        tags: form.tags,
      };

      if (isEdit) {
        const { error: err } = await supabase.from("entries").update(payload).eq("id", entry!.id);
        if (err) { toastError("Failed to save changes"); return; }
        success("Changes saved!");
        router.push(`/entries/${entry!.id}`);
      } else {
        const { data, error: err } = await supabase.from("entries").insert(payload).select().single();
        if (err) { toastError("Failed to create entry"); return; }
        success("Entry created! ✨");
        if (data) router.push(`/entries/${data.id}`);
        else router.push("/dashboard");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="entry-form-page">
      {/* Header */}
      <div className="entry-form-header">
        <Link href={isEdit ? `/entries/${entry!.id}` : "/dashboard"} className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} />
          {isEdit ? "Back to entry" : "Back"}
        </Link>
        <h1 className="entry-form-title">{isEdit ? "Edit Entry" : "New Entry"}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            id="btn-ai-autofill"
          >
            <Sparkles size={14} style={{ color: "#a78bfa" }} />
            AI Autofill
          </button>
          <button
            form="entry-form"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={saving || !form.title.trim()}
            id="btn-save-entry"
          >
            {saving ? <Loader2 size={14} className="spin" /> : null}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Entry"}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="ai-panel animate-fade-in">
          <div className="ai-panel-header">
            <Sparkles size={16} style={{ color: "#a78bfa" }} />
            <span>AI Autofill — paste a title, link, or description</span>
          </div>
          <div className="ai-banner">
            ⚠ AI-drafted fields will be marked for review — nothing saves until you click &quot;Create Entry&quot;
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              className="input"
              rows={3}
              placeholder="Paste a URL, description, or just the name of a tool/command…"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              style={{ resize: "vertical" }}
            />
            <button
              className="btn btn-primary"
              onClick={handleAiAutofill}
              disabled={aiLoading || !aiInput.trim()}
            >
              {aiLoading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
              {aiLoading ? "Drafting…" : "Draft"}
            </button>
          </div>
        </div>
      )}

      {aiDrafted && (
        <div className="ai-drafted-notice animate-fade-in">
          <Sparkles size={13} />
          Some fields were AI-drafted — please review everything before saving
          <button className="btn btn-ghost btn-sm" onClick={() => setAiDrafted(false)}>
            <X size={12} /> Dismiss
          </button>
        </div>
      )}

      <form id="entry-form" onSubmit={handleSubmit} className="entry-form-body">
        {/* Required fields */}
        <div className="form-section">
          <div className="form-section-title">Required</div>
          <div className="form-grid">
            <div className="form-field form-field-wide">
              <label htmlFor="field-title" className="form-label">
                Title <span style={{ color: "#f87171" }}>*</span>
              </label>
              <input
                id="field-title"
                className={cn("input", aiDrafted && "ai-drafted-field")}
                placeholder="e.g. Open Advanced Startup Options"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="field-category" className="form-label">
                Category <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select
                id="field-category"
                className="input"
                value={form.category_id}
                onChange={e => set("category_id", e.target.value)}
              >
                <option value="">— Uncategorized —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="field-type" className="form-label">Type</label>
              <select
                id="field-type"
                className="input"
                value={form.type}
                onChange={e => set("type", e.target.value)}
              >
                {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <div className="form-section-title">Tags</div>
          <div className="form-field">
            <div className="form-tag-input">
              <input
                id="field-tags"
                className="input"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>
                <Plus size={14} />
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {form.tags.map(t => (
                  <span key={t} className="tag-pill" style={{ cursor: "default" }}>
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1 }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Usefulness fields */}
        <div className="form-section">
          <div className="form-section-title">What & Why <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 400 }}>(optional but recommended)</span></div>
          <div className="form-grid">
            {[
              { key: "what_it_is", label: "What it is", placeholder: "One-line summary of what this is" },
              { key: "why_useful", label: "Why it's useful", placeholder: "The benefit — saves time, fixes a problem…" },
              { key: "who_can_use", label: "Who can use it", placeholder: "Students, developers, everyone…" },
              { key: "when_to_use", label: "When to use it", placeholder: "The situation that calls for it" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="form-field">
                <label htmlFor={`field-${key}`} className="form-label">{label}</label>
                <textarea
                  id={`field-${key}`}
                  className={cn("input", aiDrafted && "ai-drafted-field")}
                  placeholder={placeholder}
                  rows={2}
                  value={form[key as keyof typeof form] as string}
                  onChange={e => set(key, e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            ))}
            <div className="form-field form-field-wide">
              <label htmlFor="field-how_to_use" className="form-label">How to use it</label>
              <textarea
                id="field-how_to_use"
                className={cn("input", aiDrafted && "ai-drafted-field")}
                placeholder="Step-by-step instructions…"
                rows={4}
                value={form.how_to_use}
                onChange={e => set("how_to_use", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="field-example" className="form-label">Example</label>
              <textarea
                id="field-example"
                className={cn("input", aiDrafted && "ai-drafted-field")}
                placeholder="A real, concrete use case"
                rows={2}
                value={form.example}
                onChange={e => set("example", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Command & metadata */}
        <div className="form-section">
          <div className="form-section-title">Command / Snippet & Metadata</div>
          <div className="form-grid">
            <div className="form-field form-field-wide">
              <label htmlFor="field-command_snippet" className="form-label">Command / Snippet</label>
              <textarea
                id="field-command_snippet"
                className={cn("input", aiDrafted && "ai-drafted-field")}
                placeholder="Copyable code, shell command, or snippet"
                rows={3}
                value={form.command_snippet}
                onChange={e => set("command_snippet", e.target.value)}
                style={{ resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="field-difficulty" className="form-label">Difficulty</label>
              <select id="field-difficulty" className="input" value={form.difficulty} onChange={e => set("difficulty", e.target.value)}>
                <option value="">— Not set —</option>
                {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="field-platform" className="form-label">Platform</label>
              <select id="field-platform" className="input" value={form.platform} onChange={e => set("platform", e.target.value)}>
                <option value="">— Not set —</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Color & image */}
        <div className="form-section">
          <div className="form-section-title">Appearance</div>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">Card Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={cn("color-dot", !form.color && "color-dot-active")}
                  style={{ background: "var(--bg-card-hover)", border: "2px solid var(--border-default)" }}
                  onClick={() => set("color", "")}
                  title="Default"
                />
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    className={cn("color-dot", form.color === c.value && "color-dot-active")}
                    style={{ background: COLOR_MAP[c.value] }}
                    onClick={() => set("color", c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Screenshot / Image</label>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg}
                >
                  {uploadingImg ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                  {uploadingImg ? "Uploading…" : "Upload image"}
                </button>
              </div>
              {form.images.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-card)" }} />
                      <button
                        type="button"
                        onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                        style={{
                          position: "absolute", top: -6, right: -6,
                          background: "#ef4444", border: "none", borderRadius: "50%",
                          width: 18, height: 18, display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", color: "#fff",
                        }}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .entry-form-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .entry-form-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 32px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .entry-form-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .ai-panel {
          background: rgba(139,92,246,0.06);
          border-bottom: 1px solid rgba(139,92,246,0.2);
          padding: 20px 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ai-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #c4b5fd;
        }

        .ai-banner {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12.5px;
          color: #c4b5fd;
        }

        .ai-drafted-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 32px;
          background: rgba(139,92,246,0.08);
          border-bottom: 1px solid rgba(139,92,246,0.2);
          font-size: 13px;
          color: #c4b5fd;
        }

        .ai-drafted-field {
          border-color: rgba(139,92,246,0.4) !important;
          background: rgba(139,92,246,0.04) !important;
        }

        .entry-form-body {
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 960px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field-wide {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
        }

        .form-tag-input {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .color-dot:hover {
          transform: scale(1.2);
        }

        .color-dot-active {
          border-color: white !important;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
          transform: scale(1.15);
        }

        .spin {
          animation: spin 0.7s linear infinite;
        }

        @media (max-width: 768px) {
          .entry-form-header, .entry-form-body, .ai-panel, .ai-drafted-notice {
            padding-left: 16px;
            padding-right: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-field-wide {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}
