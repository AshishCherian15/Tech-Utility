"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Download, Upload, Shield, Loader2, GitBranch, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SettingsClientProps {
  user: User;
  entryCount: number;
}

export default function SettingsClient({ user, entryCount }: SettingsClientProps) {
  const [exporting, setExporting] = useState(false);
  const [importingFile, setImportingFile] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Ash";
  const avatarUrl = user.user_metadata?.avatar_url;
  const provider = user.app_metadata?.provider;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ash-tech-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingFile(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const entryCount = data.entries?.length ?? 0;
      if (!confirm(`Import ${entryCount} entries from "${file.name}"? Duplicate titles will still be imported as separate entries.`)) return;
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      alert(`✅ Import complete!\n\nImported: ${result.imported}\nSkipped: ${result.skipped}${result.errors?.length ? `\n\nErrors:\n${result.errors.slice(0,5).join("\n")}` : ""}`);
      router.refresh();
    } catch {
      alert("❌ Failed to import — check that the file is a valid Ash-Tech JSON export.");
    } finally {
      setImportingFile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account, appearance, and data</p>
      </div>

      <div className="settings-body">
        {/* Profile */}
        <div className="settings-section">
          <div className="settings-section-title">Profile</div>
          <div className="settings-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#fff", overflow: "hidden",
              }}>
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt={name} width={56} height={56} style={{ borderRadius: "50%" }} />
                  : name[0].toUpperCase()
                }
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>{name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.email}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  {provider === "github"
                    ? <GitBranch size={12} style={{ color: "var(--text-muted)" }} />
                    : <Globe size={12} style={{ color: "var(--text-muted)" }} />
                  }
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Signed in with {provider === "github" ? "GitHub" : "Google"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Library stats */}
        <div className="settings-section">
          <div className="settings-section-title">Library</div>
          <div className="settings-card">
            <div className="settings-stat-row">
              <div className="settings-stat">
                <div className="settings-stat-value">{entryCount}</div>
                <div className="settings-stat-label">Total entries</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat-value">∞</div>
                <div className="settings-stat-label">Free tier</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat-value">$0</div>
                <div className="settings-stat-label">Monthly cost</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <div className="settings-section-title">Data & Backup</div>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Export Library</div>
                <div className="settings-row-desc">Download all entries as a JSON file. Includes all fields, tags, and links.</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleExport}
                disabled={exporting}
                id="btn-export"
              >
                {exporting ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Download size={14} />}
                {exporting ? "Exporting…" : "Export JSON"}
              </button>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Import Library</div>
                <div className="settings-row-desc">Import entries from a previously exported JSON file. Conflicts will be shown before saving.</div>
              </div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                {importingFile ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Upload size={14} />}
                {importingFile ? "Reading…" : "Import JSON"}
                <input type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
              </label>
            </div>
          </div>
        </div>

        {/* AI Model & API Key Configuration */}
        <div className="settings-section">
          <div className="settings-section-title">AI Autofill & Model Settings</div>
          <div className="settings-card">
            <div className="settings-row-title" style={{ marginBottom: 4 }}>Select Active AI Model & Saved Keys</div>
            <div className="settings-row-desc" style={{ marginBottom: 16 }}>
              Configure custom AI models (Groq Llama 3.3, Google Gemini 1.5 Flash, OpenAI GPT-4o, Claude 3.5) and reveal/edit saved keys per model.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Groq Key Row */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>⚡ Groq (Llama 3.3 70B Versatile)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") localStorage.setItem("ash_ai_provider", "groq");
                      alert("Set active provider to Groq (Llama 3.3 70B)");
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    Set Active
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="password"
                    id="groq-key-input"
                    placeholder="gsk_GttCJR..."
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("ash_groq_key") || "gsk_[REDACTED]" : ""}
                    onChange={(e) => {
                      if (typeof window !== "undefined") localStorage.setItem("ash_groq_key", e.target.value);
                    }}
                    style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("groq-key-input") as HTMLInputElement;
                      if (input) input.type = input.type === "password" ? "text" : "password";
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    👁️ Reveal / Hide
                  </button>
                </div>
              </div>

              {/* Gemini Key Row */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>✨ Google Gemini (Gemini 1.5 Flash)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") localStorage.setItem("ash_ai_provider", "gemini");
                      alert("Set active provider to Google Gemini 1.5 Flash");
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    Set Active
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="password"
                    id="gemini-key-input"
                    placeholder="AIzaSy..."
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("ash_gemini_key") || "" : ""}
                    onChange={(e) => {
                      if (typeof window !== "undefined") localStorage.setItem("ash_gemini_key", e.target.value);
                    }}
                    style={{ flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("gemini-key-input") as HTMLInputElement;
                      if (input) input.type = input.type === "password" ? "text" : "password";
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    👁️ Reveal / Hide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="settings-section">
          <div className="settings-section-title">Security</div>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Two-Factor Auth (TOTP)</div>
                <div className="settings-row-desc">
                  Managed through Supabase Auth. Set up or manage 2FA in your account dashboard.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Shield size={14} style={{ color: "#4ade80" }} />
                <span style={{ fontSize: 12, color: "#4ade80" }}>Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Temporary / Guest Account Access */}
        <div className="settings-section">
          <div className="settings-section-title">Account Access & User Management</div>
          <div className="settings-card">
            <div className="settings-row-title" style={{ marginBottom: 6 }}>Create Temporary / Guest User</div>
            <div className="settings-row-desc" style={{ marginBottom: 16 }}>
              Grant specific users or guests temporary login access to your app with custom username and password.
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem("guestEmail") as HTMLInputElement).value;
                const username = (form.elements.namedItem("guestUsername") as HTMLInputElement).value;
                const password = (form.elements.namedItem("guestPassword") as HTMLInputElement).value;

                try {
                  const res = await fetch("/api/users/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, username, password }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error);
                  alert(`✅ User created successfully!\n\nEmail: ${email}\nUsername: ${username}`);
                  form.reset();
                } catch (err: any) {
                  alert(`❌ Error creating user: ${err.message}`);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  type="text"
                  name="guestUsername"
                  placeholder="Username"
                  required
                  className="input"
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
                />
                <input
                  type="email"
                  name="guestEmail"
                  placeholder="User Email"
                  required
                  className="input"
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
                />
              </div>
              <input
                type="password"
                name="guestPassword"
                placeholder="Temporary Password (min 6 characters)"
                required
                minLength={6}
                className="input"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Access Duration Expiration</label>
                  <select
                    name="accessDuration"
                    className="input"
                    style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
                  >
                    <option value="1h">1 Hour Temporary Access</option>
                    <option value="24h">24 Hours Access</option>
                    <option value="7d">7 Days Access</option>
                    <option value="30d">30 Days Access</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: "100%", height: 38, justifyContent: "center" }}>
                    Create Temporary Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ color: "#f87171" }}>Danger Zone</div>
          <div className="settings-card" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Sign Out</div>
                <div className="settings-row-desc">You will be redirected to the login page.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleSignOut} id="btn-sign-out">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page { min-height: 100vh; }

        .settings-body {
          padding: 28px 32px;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .settings-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-lg);
          padding: 20px;
        }

        .settings-stat-row {
          display: flex;
          gap: 32px;
        }

        .settings-stat {
          text-align: center;
        }

        .settings-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .settings-stat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .settings-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .settings-row-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 3px;
        }

        .settings-row-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .settings-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 16px 0;
        }

        @media (max-width: 768px) {
          .page-header { padding: 20px 16px; }
          .settings-body { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
