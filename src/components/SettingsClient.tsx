"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Download, Upload, Shield, Loader2, GitBranch, Globe, Eye, EyeOff, UserCheck, UserX, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SettingsClientProps {
  user: User;
  entryCount: number;
}

function UserManagementForm() {
  const [accountType, setAccountType] = useState<"permanent" | "temporary">("temporary");
  const [showPassword, setShowPassword] = useState(false);
  const [expirationMode, setExpirationMode] = useState<"none" | "preset" | "custom">("preset");
  const [presetDuration, setPresetDuration] = useState("1h");
  const [customHours, setCustomHours] = useState("0");
  const [customMinutes, setCustomMinutes] = useState("30");
  const [customSeconds, setCustomSeconds] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("userEmail") as HTMLInputElement).value;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("userPassword") as HTMLInputElement).value;

    let durationString = "none";
    if (accountType === "temporary") {
      if (expirationMode === "none") {
        durationString = "none";
      } else if (expirationMode === "preset") {
        durationString = presetDuration;
      } else {
        const h = parseInt(customHours || "0", 10);
        const m = parseInt(customMinutes || "0", 10);
        const s = parseInt(customSeconds || "0", 10);
        const totalSecs = (h * 3600) + (m * 60) + s;
        durationString = `${totalSecs}s`;
      }
    }

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          account_type: accountType,
          duration: durationString,
          enabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      alert(`✅ User created successfully!\n\nType: ${accountType.toUpperCase()}\nEmail: ${email}\nStatus: ${enabled ? "ACTIVE" : "DISABLED"}\nExpiration: ${durationString === "none" ? "No Expiration" : durationString}`);
      form.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating user";
      alert(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Account Type Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          onClick={() => setAccountType("temporary")}
          style={{
            padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: accountType === "temporary" ? "rgba(59,130,246,0.15)" : "var(--bg-base)",
            border: `1px solid ${accountType === "temporary" ? "#3b82f6" : "var(--border-subtle)"}`,
            color: accountType === "temporary" ? "#60a5fa" : "var(--text-muted)", cursor: "pointer"
          }}
        >
          ⏱️ Temporary / Guest Account
        </button>
        <button
          type="button"
          onClick={() => setAccountType("permanent")}
          style={{
            padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: accountType === "permanent" ? "rgba(34,197,94,0.15)" : "var(--bg-base)",
            border: `1px solid ${accountType === "permanent" ? "#22c55e" : "var(--border-subtle)"}`,
            color: accountType === "permanent" ? "#4ade80" : "var(--text-muted)", cursor: "pointer"
          }}
        >
          🛡️ Permanent Account
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input
          type="text"
          name="username"
          placeholder="Username (e.g. admin_guest)"
          required
          className="input"
          style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
        />
        <input
          type="email"
          name="userEmail"
          placeholder="User Email (guest@ash-tech.app)"
          required
          className="input"
          style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
        />
      </div>

      {/* Password with Eye Reveal */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type={showPassword ? "text" : "password"}
          name="userPassword"
          placeholder="Account Password (min 6 characters)"
          required
          minLength={6}
          className="input"
          style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 40px 8px 12px", color: "var(--text-primary)", fontSize: 13 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: "absolute", right: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          title={showPassword ? "Hide password" : "Reveal password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Expiration Controls for Temporary accounts */}
      {accountType === "temporary" && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", padding: 14, borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} style={{ color: "#f59e0b" }} /> Time Expiration Setup
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[
              { id: "none", label: "No Expiration" },
              { id: "preset", label: "Preset Duration" },
              { id: "custom", label: "Custom (Hrs/Mins/Secs)" },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setExpirationMode(m.id as "none" | "preset" | "custom")}
                style={{
                  padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                  background: expirationMode === m.id ? "var(--bg-surface-hover)" : "transparent",
                  border: `1px solid ${expirationMode === m.id ? "var(--border-default)" : "transparent"}`,
                  color: expirationMode === m.id ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer"
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {expirationMode === "preset" && (
            <select
              value={presetDuration}
              onChange={(e) => setPresetDuration(e.target.value)}
              className="input"
              style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
            >
              <option value="1h">1 Hour Temporary Access</option>
              <option value="6h">6 Hours Access</option>
              <option value="24h">24 Hours (1 Day) Access</option>
              <option value="7d">7 Days Access</option>
              <option value="30d">30 Days Access</option>
            </select>
          )}

          {expirationMode === "custom" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>Hours</label>
                <input
                  type="number"
                  min="0"
                  max="720"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Account Status Toggle: Enabled vs Disabled */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {enabled ? <UserCheck size={16} style={{ color: "#4ade80" }} /> : <UserX size={16} style={{ color: "#f87171" }} />}
          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
            Account Access Status: <strong style={{ color: enabled ? "#4ade80" : "#f87171" }}>{enabled ? "ENABLED" : "DISABLED"}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          Toggle {enabled ? "Disable" : "Enable"}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-sm"
        style={{ height: 40, justifyContent: "center", marginTop: 4, fontWeight: 600 }}
      >
        {loading ? <Loader2 size={16} className="spin" /> : null}
        {loading ? "Creating Account…" : `Create ${accountType === "permanent" ? "Permanent" : "Temporary"} Account`}
      </button>
    </form>
  );
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

        {/* Account Access & User Management */}
        <div className="settings-section">
          <div className="settings-section-title">Account Access & User Management</div>
          <div className="settings-card">
            <div className="settings-row-title" style={{ marginBottom: 6 }}>Create User Account & Access Control</div>
            <div className="settings-row-desc" style={{ marginBottom: 16 }}>
              Create Permanent or Temporary / Guest user logins with password reveal options, custom time expiration (Hours, Minutes, Seconds), or Unlimited duration, and enable/disable account access.
            </div>

            <UserManagementForm />
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
