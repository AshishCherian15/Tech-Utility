"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Link2, Sparkles, Plus, X, Upload, Loader2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import type { Category, Entry, EntryType, DifficultyLevel, Platform } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { useImageUrls } from "@/lib/use-image-urls";
import { useAIConfig } from "@/components/AIConfigProvider";

const ENTRY_TYPES: EntryType[] = ["Tip","Trick","Hack","App","Website","Tool","Extension","Command","Guide","Prompt"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["Easy", "Medium", "Hard"];
const PLATFORMS: Platform[] = ["Windows","Android","iOS","macOS","Linux","Web","Cross-platform"];
const PRICING_TIERS = ["free", "freemium", "paid"] as const;
const MAX_TAGS = 100;
const MAX_TAG_LENGTH = 100;
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

async function optimizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 2000;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const optimized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82)
    );
    if (!optimized || optimized.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([optimized], `${baseName}.webp`, { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}

interface EntryFormProps {
  categories: Category[];
  entry?: Entry;
  sharedContent?: { title?: string; text?: string; url?: string };
  initialType?: EntryType;
}

export default function EntryForm({ categories, entry, sharedContent, initialType }: EntryFormProps) {
  const isEdit = !!entry;
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError, ai: toastAi } = useToast();
  const { config: aiConfig } = useAIConfig();

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [aiDrafted, setAiDrafted] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkPreviewUrl, setLinkPreviewUrl] = useState("");
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);

  // Form state
  const sharedDetails = [
    sharedContent?.text,
    sharedContent?.url ? `Shared URL: ${sharedContent.url}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 10000);
  const [form, setForm] = useState({
    title: entry?.title ?? sharedContent?.title ?? "",
    category_id: entry?.category_id ?? "",
    type: entry?.type ?? initialType ?? "Tip",
    tags: entry?.tags ?? [] as string[],
    what_it_is: entry?.what_it_is ?? sharedDetails,
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
    status: entry?.status ?? "DRAFT",
    hero_tag: entry?.hero_tag ?? "",
    cover_image_url: entry?.cover_image_url ?? "",
    pricing: (entry?.pricing ?? "") as typeof PRICING_TIERS[number] | "",
    pricing_note: entry?.pricing_note ?? "",
  });
  const imageUrls = useImageUrls(form.images);

  const set = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    if (t && !form.tags.includes(t) && form.tags.length < MAX_TAGS) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (t: string) =>
    set("tags", form.tags.filter(x => x !== t));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
    if (!allowedImageTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      toastError("Choose an image smaller than 10 MB");
      e.target.value = "";
      return;
    }
    setUploadingImg(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toastError("Sign in again before uploading an image");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
      const uploadFile = await optimizeImage(file);
      const uploadExtension = uploadFile.name.split(".").pop()?.toLowerCase() || ext;
      const path = `${user.id}/${crypto.randomUUID()}.${uploadExtension}`;
      const { error } = await supabase.storage
        .from("entry-images")
        .upload(path, uploadFile, { cacheControl: "3600", upsert: false, contentType: uploadFile.type });
      if (error) {
        toastError("Image upload failed");
      } else {
        set("images", [...form.images, `storage://entry-images/${path}`]);
      }
    } catch {
      toastError("Image upload failed");
    } finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleAiAutofill = async () => {
    if (!aiInput.trim()) return;
    if (!aiConfig.apiKey.trim()) {
      toastError("Add an AI API key in Settings before using autofill.");
      return;
    }
    setAiLoading(true);

    try {
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: "text",
          content: aiInput,
          provider: aiConfig.provider,
          api_key: aiConfig.apiKey,
          model: aiConfig.model,
          endpoint: aiConfig.endpoint,
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
          hero_tag: draft.hero_tag ?? prev.hero_tag,
          pricing: draft.pricing ?? prev.pricing,
          pricing_note: draft.pricing_note ?? prev.pricing_note,
        }));
        setAiDrafted(true);
        setShowAiPanel(false);
        toastAi("Fields drafted — review everything before saving");
      }
    } catch {
      toastError("AI autofill could not connect. Check your connection or fill the form manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleLinkPreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!linkPreviewUrl.trim()) return;

    setLinkPreviewLoading(true);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkPreviewUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Preview fetch failed");

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        what_it_is: data.description || prev.what_it_is,
        images: data.image && !prev.images.includes(data.image) ? [...prev.images, data.image] : prev.images,
      }));
      setShowLinkPanel(false);
      toastAi("Link details added — review them before saving");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Preview fetch failed";
      toastError(`Could not fetch link preview: ${message}`);
    } finally {
      setLinkPreviewLoading(false);
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
        pricing: form.pricing || null,
        pricing_note: form.pricing_note || null,
        tags: form.tags,
        hero_tag: form.hero_tag || null,
        cover_image_url: form.cover_image_url || null,
      };

      if (isEdit) {
        const response = await fetch(`/api/entries/${entry!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => null);
          toastError(result?.error ?? "Failed to save changes");
          return;
        }
        success("Changes saved!");
        router.push(`/entries/${entry!.id}`);
      } else {
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          toastError(data?.error ?? "Failed to create entry");
          return;
        }
        success("Entry created! ✨");
        if (data) router.push(`/entries/${data.id}`);
        else router.push("/dashboard");
      }
    } catch {
      toastError(isEdit
        ? "Could not save changes. Check your connection and try again."
        : "Could not create the entry. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="entry-form-page" aria-busy={saving || uploadingImg || aiLoading}>
      {/* Header */}
      <div className="entry-form-header">
        <BackLink href={isEdit ? `/entries/${entry!.id}` : "/dashboard"}>
          {isEdit ? "Back to entry" : "Back"}
        </BackLink>
        <h1 className="entry-form-title">{isEdit ? "Edit Entry" : "New Entry"}</h1>
        <div className="entry-form-tools">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setShowLinkPanel(value => !value);
              setShowAiPanel(false);
            }}
            aria-expanded={showLinkPanel}
            aria-controls="link-preview-panel"
            id="btn-link-preview"
          >
            <Link2 size={14} aria-hidden="true" />
            Link preview
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setShowAiPanel(value => !value);
              setShowLinkPanel(false);
            }}
            aria-expanded={showAiPanel}
            aria-controls="ai-autofill-panel"
            id="btn-ai-autofill"
          >
            <Sparkles size={14} aria-hidden="true" />
            AI draft
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              set("status", "DRAFT");
              const ev = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(ev);
            }}
            disabled={saving || !form.title.trim()}
            id="btn-save-draft"
          >
            {saving && form.status === "DRAFT" ? <Loader2 size={14} aria-hidden="true" className="spin" /> : null}
            {isEdit ? "Save Draft" : "Save as Draft"}
          </button>
          <button
            form="entry-form"
            type="submit"
            className="btn btn-primary btn-sm"
            onClick={() => set("status", "PENDING")}
            disabled={saving || !form.title.trim()}
            id="btn-submit-review"
          >
            {saving && form.status === "PENDING" ? <Loader2 size={14} aria-hidden="true" className="spin" /> : null}
            {saving && form.status === "PENDING" ? "Submitting…" : isEdit ? "Submit for Review" : "Submit for Review"}
          </button>
        </div>
      </div>

      {showLinkPanel && (
        <form
          id="link-preview-panel"
          className="link-preview-panel animate-fade-in"
          onSubmit={handleLinkPreview}
          aria-label="Import details from a link"
        >
          <div className="link-preview-copy">
            <Link2 size={18} aria-hidden="true" />
            <div>
              <strong>Start from a link</strong>
              <p>We’ll use its public page title, description, and preview image as editable suggestions.</p>
            </div>
          </div>
          <div className="link-preview-controls">
            <label className="visually-hidden" htmlFor="link-preview-url">Website URL</label>
            <input
              id="link-preview-url"
              className="input"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com/article"
              value={linkPreviewUrl}
              onChange={event => setLinkPreviewUrl(event.target.value)}
              required
            />
            <button type="submit" className="btn btn-secondary" disabled={linkPreviewLoading || !linkPreviewUrl.trim()}>
              {linkPreviewLoading ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
              {linkPreviewLoading ? "Fetching…" : "Fetch details"}
            </button>
          </div>
          <p className="link-preview-note">Nothing is saved until you create the entry. Check suggested details before saving.</p>
        </form>
      )}

      {/* AI Panel */}
      {showAiPanel && (
        <div id="ai-autofill-panel" className="ai-panel animate-fade-in">
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
              aria-label="Text for AI autofill"
              rows={3}
              placeholder="Paste a URL, description, or just the name of a tool/command…"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              maxLength={20000}
              style={{ resize: "vertical" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAiAutofill}
              disabled={aiLoading || !aiInput.trim()}
            >
              {aiLoading ? <Loader2 size={15} aria-hidden="true" className="spin" /> : <Sparkles size={15} aria-hidden="true" />}
              {aiLoading ? "Drafting…" : "Draft"}
            </button>
          </div>
        </div>
      )}

      {aiDrafted && (
        <div className="ai-drafted-notice animate-fade-in" role="status">
          <Sparkles size={13} aria-hidden="true" />
          Some fields were AI-drafted — please review everything before saving
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAiDrafted(false)}>
            <X size={12} aria-hidden="true" /> Dismiss
          </button>
        </div>
      )}

      <form id="entry-form" onSubmit={handleSubmit} className="entry-form-body">
        {!isEdit && (
          <div className="entry-form-intro">
            <span className="entry-form-intro-icon"><Plus size={18} aria-hidden="true" /></span>
            <div>
              <h2>Capture something useful</h2>
              <p>Save it now, add detail when you have time. Only a title is required.</p>
            </div>
          </div>
        )}

        {/* Required fields */}
        <div className="form-section">
          <div className="form-section-title">Basics <span>Start with a title and type</span></div>
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
                maxLength={500}
                required
              />
            </div>
            
            <div className="form-field form-field-wide">
              <label htmlFor="field-hero-tag" className="form-label">Hero Tag</label>
              <input
                id="field-hero-tag"
                className={cn("input", aiDrafted && "ai-drafted-field")}
                placeholder="A short punchy phrase for the preview card"
                value={form.hero_tag}
                onChange={e => set("hero_tag", e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="form-field">
              <label htmlFor="field-category" className="form-label">Category (optional)</label>
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
                aria-label="Add a tag"
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                maxLength={MAX_TAG_LENGTH}
                disabled={form.tags.length >= MAX_TAGS}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addTag} disabled={form.tags.length >= MAX_TAGS || !tagInput.trim()}>
                <Plus size={14} aria-hidden="true" />
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div role="group" aria-label={`Tags, ${form.tags.length} of ${MAX_TAGS}`}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {form.tags.map(t => (
                  <span key={t} className="tag-pill" style={{ cursor: "default" }}>
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove tag ${t}`}
                      onClick={() => removeTag(t)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 4, minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                    >
                      <X size={11} aria-hidden="true" />
                    </button>
                  </span>
                ))}
                </div>
                <span className="sr-only">{form.tags.length} tags added</span>
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
                  maxLength={10000}
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
                maxLength={10000}
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
                maxLength={10000}
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
                maxLength={10000}
                style={{ resize: "vertical", fontFamily: "'Cascadia Code', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace", fontSize: 13 }}
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
            <div className="form-field">
              <label htmlFor="field-pricing" className="form-label">Pricing</label>
              <select id="field-pricing" className="input" value={form.pricing} onChange={e => set("pricing", e.target.value)}>
                <option value="">— Not set —</option>
                {PRICING_TIERS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            {form.pricing === "freemium" || form.pricing === "paid" ? (
              <div className="form-field">
                <label htmlFor="field-pricing-note" className="form-label">Pricing Details</label>
                <input
                  id="field-pricing-note"
                  type="text"
                  className="input"
                  placeholder="e.g., Free tier includes 5 projects, Pro is $9/mo"
                  value={form.pricing_note}
                  onChange={e => set("pricing_note", e.target.value)}
                  maxLength={500}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Color & image */}
        <div className="form-section">
          <div className="form-section-title">Appearance</div>
          <div className="form-grid">
            <div className="form-field">
              <span className="form-label" id="entry-color-label">Card Color</span>
              <div role="group" aria-labelledby="entry-color-label" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={cn("color-dot", !form.color && "color-dot-active")}
                  style={{ background: "var(--bg-card-hover)", border: "2px solid var(--border-default)" }}
                  onClick={() => set("color", "")}
                  title="Default"
                  aria-label="Use default card color"
                  aria-pressed={!form.color}
                />
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    className={cn("color-dot", form.color === c.value && "color-dot-active")}
                    style={{ background: COLOR_MAP[c.value] }}
                    onClick={() => set("color", c.value)}
                    title={c.label}
                    aria-label={`Use ${c.label} card color`}
                    aria-pressed={form.color === c.value}
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
                  aria-label="Choose image to upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImg}
                  aria-label={uploadingImg ? "Uploading image" : "Upload an image"}
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
                      {imageUrls[i] && <img src={imageUrls[i]} alt={`Entry image ${i + 1}`} loading="lazy" decoding="async" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-card)" }} />}
                      <button
                        type="button"
                        aria-label={`Remove image ${i + 1}`}
                        onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                        style={{
                          position: "absolute", top: -6, right: -6,
                          background: "#ef4444", border: "none", borderRadius: "50%",
                          width: 44, height: 44, display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", color: "#fff",
                        }}
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      <div className="entry-mobile-save">
        <button
          form="entry-form"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={saving || !form.title.trim()}
        >
          {saving ? <Loader2 size={16} aria-hidden="true" className="spin" /> : null}
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create entry"}
        </button>
      </div>

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
          background: color-mix(in srgb, var(--bg-surface) 88%, transparent);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .entry-form-tools {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .entry-form-header .btn-sm {
          min-height: 42px;
        }

        .entry-form-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .link-preview-panel {
          display: grid;
          grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
          gap: 12px 24px;
          align-items: center;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(34, 211, 238, 0.2);
          background: linear-gradient(110deg, rgba(8, 145, 178, 0.13), rgba(59, 130, 246, 0.05));
        }

        .link-preview-copy {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: var(--brand-cyan);
        }

        .link-preview-copy strong {
          display: block;
          color: var(--text-primary);
          font-size: 14px;
        }

        .link-preview-copy p,
        .link-preview-note {
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.55;
        }

        .link-preview-controls {
          display: flex;
          gap: 10px;
        }

        .link-preview-note {
          grid-column: 2;
          margin-top: -8px;
        }

        .entry-mobile-save {
          display: none;
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
          width: min(100%, 1024px);
          margin: 0 auto;
          padding: 28px 32px 48px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .entry-form-intro {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          background: linear-gradient(125deg, rgba(59, 130, 246, 0.1), rgba(34, 211, 238, 0.035));
        }

        .entry-form-intro-icon {
          display: grid;
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          place-items: center;
          border-radius: 13px;
          color: var(--brand-blue-bright);
          background: rgba(59, 130, 246, 0.14);
        }

        .entry-form-intro h2 {
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.35;
        }

        .entry-form-intro p {
          margin-top: 3px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
        }

        .form-section-title {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .form-section-title span {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 400;
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
          width: 44px;
          height: 44px;
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
          .entry-form-header {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 8px 12px;
          }
          .entry-form-title {
            grid-column: 2;
            grid-row: 1;
          }
          .entry-form-tools {
            grid-column: 1 / -1;
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
          .entry-form-tools .btn {
            padding-inline: 8px;
            font-size: 12px;
          }
          .entry-form-body, .ai-panel, .ai-drafted-notice {
            padding-left: 16px;
            padding-right: 16px;
          }
          .form-section {
            padding: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-field-wide {
            grid-column: 1;
          }
          .link-preview-panel {
            grid-template-columns: 1fr;
            padding: 18px 16px;
          }
          .link-preview-note {
            grid-column: 1;
            margin-top: 0;
          }
          .entry-form-header #btn-save-entry {
            display: none;
          }
          .entry-mobile-save {
            display: block;
            position: sticky;
            bottom: 0;
            z-index: 35;
            padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--border-subtle);
            background: color-mix(in srgb, var(--bg-surface) 92%, transparent);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
          }
          .entry-mobile-save .btn {
            width: 100%;
            min-height: 50px;
          }
        }

        @media (max-width: 420px) {
          .entry-form-header {
            padding: 10px 12px;
            gap: 8px;
          }
          .entry-form-title {
            font-size: 15px;
          }
          .entry-form-tools .btn {
            min-height: 40px;
            flex: 1;
          }
          .entry-form-intro {
            align-items: flex-start;
            padding: 15px;
          }
          .link-preview-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
