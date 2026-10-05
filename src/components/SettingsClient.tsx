"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Download, Upload, Shield, Loader2, GitBranch, Globe, Eye, EyeOff, UserCheck, UserX, Clock, Trash2, Edit2, X } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { useAIConfig, type AIProvider } from "@/components/AIConfigProvider";

interface SettingsClientProps {
  user: User;
  entryCount: number;
  isOwner: boolean;
}

interface ManagedAccount {
  id: string;
  email: string;
  username: string;
  accountType: "permanent" | "temporary";
  enabled: boolean;
  expiresAt: string | null;
  expired: boolean;
  canCreateEntries: boolean;
}

interface EditingAccount {
  account: ManagedAccount;
  username: string;
  email: string;
  password: string;
  showPassword: boolean;
  canCreateEntries: boolean;
}

const accountListSchema = z.object({
  users: z.array(z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    accountType: z.enum(["permanent", "temporary"]),
    enabled: z.boolean(),
    expiresAt: z.string().nullable(),
    expired: z.boolean(),
    canCreateEntries: z.boolean().optional(),
  })),
  truncated: z.boolean(),
});

function UserManagementForm({ onCreated }: { onCreated: () => void }) {
  const [accountType, setAccountType] = useState<"permanent" | "temporary">("temporary");
  const [showPassword, setShowPassword] = useState(false);
  const [expirationMode, setExpirationMode] = useState<"preset" | "custom">("preset");
  const [presetDuration, setPresetDuration] = useState("1h");
  const [customHours, setCustomHours] = useState("0");
  const [customMinutes, setCustomMinutes] = useState("30");
  const [customSeconds, setCustomSeconds] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [canCreateEntries, setCanCreateEntries] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [expirationError, setExpirationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("userEmail") as HTMLInputElement).value;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("userPassword") as HTMLInputElement).value;

    let durationString = "none";
    if (accountType === "temporary") {
      if (expirationMode === "preset") {
        durationString = presetDuration;
      } else {
        const h = Number(customHours || "0");
        const m = Number(customMinutes || "0");
        const s = Number(customSeconds || "0");
        if (!Number.isInteger(h) || !Number.isInteger(m) || !Number.isInteger(s) ||
          h < 0 || h > 720 || m < 0 || m > 59 || s < 0 || s > 59) {
          setExpirationError("Enter hours from 0 to 720, and minutes and seconds from 0 to 59.");
          setLoading(false);
          return;
        }
        const totalSecs = (h * 3600) + (m * 60) + s;
        if (totalSecs < 1 || totalSecs > 30 * 24 * 60 * 60) {
          setExpirationError("Custom access duration must be between one second and 30 days.");
          setLoading(false);
          return;
        }
        durationString = `${totalSecs}s`;
      }
    }
    setExpirationError(null);

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
          can_create_entries: canCreateEntries,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create the account");
      setFeedback({
        isError: false,
        message: `Account created for ${email}. ${accountType === "temporary" ? `Access expires in ${durationString}.` : "Access does not expire."}`,
      });
      form.reset();
      onCreated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating user";
      setFeedback({ message: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {feedback && (
        <p role={feedback.isError ? "alert" : "status"} style={{ color: feedback.isError ? "#f87171" : "#4ade80" }}>
          {feedback.message}
        </p>
      )}
      {/* Account Type Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button
          type="button"
          onClick={() => {
            setAccountType("temporary");
            setExpirationError(null);
          }}
          aria-pressed={accountType === "temporary"}
          style={{
            minHeight: 44, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: accountType === "temporary" ? "rgba(59,130,246,0.15)" : "var(--bg-base)",
            border: `1px solid ${accountType === "temporary" ? "#3b82f6" : "var(--border-subtle)"}`,
            color: accountType === "temporary" ? "#60a5fa" : "var(--text-muted)", cursor: "pointer"
          }}
        >
          ⏱️ Temporary / Guest Account
        </button>
        <button
          type="button"
          onClick={() => {
            setAccountType("permanent");
            setExpirationError(null);
          }}
          aria-pressed={accountType === "permanent"}
          style={{
            minHeight: 44, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
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
          placeholder="Username"
          aria-label="Username"
          required
          className="input"
          style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)", fontSize: 13 }}
        />
        <input
          type="email"
          name="userEmail"
          placeholder="User email address"
          aria-label="User email address"
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
          placeholder="Password (12+ characters, number and symbol)"
          aria-label="New account password"
          required
          minLength={12}
          pattern="(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}"
          title="Use at least 12 characters, including a number and a symbol."
          autoComplete="new-password"
          className="input"
          style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 40px 8px 12px", color: "var(--text-primary)", fontSize: 13 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          style={{ position: "absolute", right: 5, minWidth: 44, minHeight: 44, display: "grid", placeItems: "center", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
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
                { id: "preset", label: "Preset Duration" },
                { id: "custom", label: "Custom (Hrs/Mins/Secs)" },
              ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setExpirationMode(m.id as "preset" | "custom");
                  setExpirationError(null);
                }}
                aria-pressed={expirationMode === m.id}
                style={{
                  minHeight: 44, padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
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
              aria-label="Temporary account expiration"
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
                <label htmlFor="expiry-hours" style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>Hours</label>
                <input
                  id="expiry-hours"
                  type="number"
                  min="0"
                  max="720"
                  step="1"
                  inputMode="numeric"
                  aria-invalid={Boolean(expirationError)}
                  aria-describedby={expirationError ? "expiration-error" : undefined}
                  value={customHours}
                  onChange={(e) => {
                    setCustomHours(e.target.value);
                    setExpirationError(null);
                  }}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
              <div>
                <label htmlFor="expiry-minutes" style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>Minutes</label>
                <input
                  id="expiry-minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  inputMode="numeric"
                  aria-invalid={Boolean(expirationError)}
                  aria-describedby={expirationError ? "expiration-error" : undefined}
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                    setExpirationError(null);
                  }}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
              <div>
                <label htmlFor="expiry-seconds" style={{ fontSize: 12, color: "var(--text-muted)", display: "block" }}>Seconds</label>
                <input
                  id="expiry-seconds"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  inputMode="numeric"
                  aria-invalid={Boolean(expirationError)}
                  aria-describedby={expirationError ? "expiration-error" : undefined}
                  value={customSeconds}
                  onChange={(e) => {
                    setCustomSeconds(e.target.value);
                    setExpirationError(null);
                  }}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                />
              </div>
            </div>
          )}
          {expirationError && <p id="expiration-error" role="alert" style={{ color: "#f87171", marginTop: 8 }}>{expirationError}</p>}
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
          aria-pressed={enabled}
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          Toggle {enabled ? "Disable" : "Enable"}
        </button>
      </div>

      {/* Entry Creation Permission Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={16} style={{ color: canCreateEntries ? "#4ade80" : "#94a3b8" }} />
          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
            Can Create Entries: <strong style={{ color: canCreateEntries ? "#4ade80" : "#94a3b8" }}>{canCreateEntries ? "YES" : "NO"}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCanCreateEntries(!canCreateEntries)}
          className="btn btn-secondary btn-sm"
          aria-pressed={canCreateEntries}
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          {canCreateEntries ? "Revoke" : "Grant"}
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

function AccountAccessList({ refreshKey }: { refreshKey: number }) {
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [renewDuration, setRenewDuration] = useState("7d");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingAccount, setEditingAccount] = useState<EditingAccount | null>(null);
  const [editFeedback, setEditFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const fetchAccounts = useCallback(async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Could not load invited accounts");
    return accountListSchema.parse(result);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchAccounts().then((result) => {
      if (cancelled) return;
      setErrorMessage(null);
      setAccounts(result.users);
      setTruncated(result.truncated);
      setLoading(false);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setErrorMessage(error instanceof Error ? error.message : "Could not load invited accounts");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAccounts, refreshKey, reloadKey]);

  const refreshAccounts = () => {
    setLoading(true);
    setErrorMessage(null);
    setReloadKey((current) => current + 1);
  };

  const toggleAccount = async (account: ManagedAccount) => {
    setUpdatingId(account.id);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_enabled", userId: account.id, enabled: !account.enabled }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const errorResult = z.object({ error: z.string() }).safeParse(result);
        throw new Error(errorResult.success ? errorResult.data.error : "Could not update invited account access");
      }
      const updated = z.object({ user: z.object({ id: z.string(), enabled: z.boolean() }) }).parse(result);
      setAccounts((current) => current.map((item) =>
        item.id === account.id ? { ...item, enabled: updated.user.enabled } : item
      ));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update invited account access");
    } finally {
      setUpdatingId(null);
    }
  };

  const renewAccount = async (account: ManagedAccount) => {
    setUpdatingId(account.id);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew", userId: account.id, duration: renewDuration }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const errorResult = z.object({ error: z.string() }).safeParse(result);
        throw new Error(errorResult.success ? errorResult.data.error : "Could not renew temporary account access");
      }
      const updated = z.object({
        user: z.object({ enabled: z.boolean(), expiresAt: z.string().nullable(), expired: z.boolean() }),
      }).parse(result);
      setAccounts((current) => current.map((item) =>
        item.id === account.id
          ? { ...item, enabled: updated.user.enabled, expiresAt: updated.user.expiresAt, expired: updated.user.expired }
          : item
      ));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not renew temporary account access");
    } finally {
      setUpdatingId(null);
    }
  };

  const startEdit = (account: ManagedAccount) => {
    setEditingAccount({
      account,
      username: account.username,
      email: account.email,
      password: "",
      showPassword: false,
      canCreateEntries: account.canCreateEntries,
    });
    setEditFeedback(null);
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setEditFeedback(null);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setUpdatingId(editingAccount.account.id);
    setEditFeedback(null);

    try {
      const body: { action: string; userId: string; username?: string; email?: string; password?: string; can_create_entries?: boolean } = {
        action: "update",
        userId: editingAccount.account.id,
      };

      if (editingAccount.username !== editingAccount.account.username) {
        body.username = editingAccount.username;
      }
      if (editingAccount.email !== editingAccount.account.email) {
        body.email = editingAccount.email;
      }
      if (editingAccount.password) {
        body.password = editingAccount.password;
      }
      if (editingAccount.canCreateEntries !== editingAccount.account.canCreateEntries) {
        body.can_create_entries = editingAccount.canCreateEntries;
      }

      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result: unknown = await response.json();
      if (!response.ok) {
        const errorResult = z.object({ error: z.string() }).safeParse(result);
        throw new Error(errorResult.success ? errorResult.data.error : "Could not update account");
      }

      const updated = z.object({
        user: z.object({
          id: z.string(),
          username: z.string(),
          email: z.string(),
          canCreateEntries: z.boolean().optional(),
        }),
      }).parse(result);

      setAccounts((current) => current.map((item) =>
        item.id === editingAccount.account.id
          ? { ...item, username: updated.user.username, email: updated.user.email, canCreateEntries: updated.user.canCreateEntries ?? item.canCreateEntries }
          : item
      ));

      setEditFeedback({ message: "Account updated successfully", isError: false });
      setTimeout(() => {
        setEditingAccount(null);
        setEditFeedback(null);
      }, 1500);
    } catch (error) {
      setEditFeedback({ message: error instanceof Error ? error.message : "Could not update account", isError: true });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ marginTop: 24, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <div className="settings-row-title">Existing invited accounts</div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={refreshAccounts}
          disabled={loading || updatingId !== null}
          style={{ minHeight: 44 }}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <p className="settings-row-desc" style={{ marginBottom: 12 }}>
        Disable access immediately or re-enable an invited account. Disabled users can no longer access their saved data.
      </p>
      {loading ? (
        <p role="status" className="settings-row-desc">Loading invited accounts…</p>
      ) : errorMessage ? (
        <p role="alert" style={{ color: "#f87171", fontSize: 13 }}>{errorMessage}</p>
      ) : accounts.length === 0 ? (
        <p className="settings-row-desc">No invited accounts yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {accounts.map((account) => {
            const expiryTime = account.expiresAt ? Date.parse(account.expiresAt) : null;
            const expired = account.expired;
            return (
              <div key={account.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 12,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>
                    {account.username} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {account.email}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                    {account.accountType === "temporary" ? "Temporary" : "Permanent"}
                    {account.expiresAt && Number.isFinite(expiryTime) ? ` · Expires ${new Date(account.expiresAt).toLocaleString()}` : ""}
                    {expired ? " · Expired" : account.enabled ? " · Enabled" : " · Disabled"}
                    {` · ${account.canCreateEntries ? "Can create entries" : "Cannot create entries"}`}
                  </div>
                  {expired && (
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <label htmlFor={`renew-duration-${account.id}`} className="settings-row-desc">
                        Renew access for
                      </label>
                      <select
                        id={`renew-duration-${account.id}`}
                        value={renewDuration}
                        onChange={(event) => setRenewDuration(event.target.value)}
                        disabled={updatingId !== null}
                        className="input"
                        style={{ minHeight: 40, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "6px 8px", color: "var(--text-primary)", fontSize: 12 }}
                      >
                        <option value="1h">1 hour</option>
                        <option value="6h">6 hours</option>
                        <option value="24h">24 hours</option>
                        <option value="7d">7 days</option>
                        <option value="30d">30 days</option>
                      </select>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => void renewAccount(account)}
                        disabled={updatingId !== null}
                        aria-label={`Renew access for ${account.email}`}
                        style={{ minHeight: 44 }}
                      >
                        {updatingId === account.id ? "Saving…" : "Renew"}
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => startEdit(account)}
                    disabled={updatingId !== null}
                    aria-label={`Edit account ${account.email}`}
                    style={{ minHeight: 44 }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className={account.enabled ? "btn btn-danger btn-sm" : "btn btn-secondary btn-sm"}
                    onClick={() => void toggleAccount(account)}
                    disabled={updatingId !== null || expired}
                    aria-label={expired && !account.enabled
                      ? `Expired account ${account.email}; use Renew to restore access`
                      : `${account.enabled ? "Disable" : "Enable"} access for ${account.email}`}
                    style={{ minHeight: 44 }}
                  >
                    {updatingId === account.id ? "Saving…" : expired && !account.enabled ? "Expired" : account.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {truncated && (
        <p className="settings-row-desc" role="status" style={{ marginTop: 8 }}>
          Showing the first 1,000 accounts. Contact support before managing a larger account list.
        </p>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            background: "var(--bg-card)",
            borderRadius: 16,
            padding: 24,
            maxWidth: 480,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            border: "1px solid var(--border-card)",
            boxShadow: "var(--shadow-elevated)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                Edit Account
              </h3>
              <button
                type="button"
                onClick={cancelEdit}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8 }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveEdit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label htmlFor="edit-username" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Username
                </label>
                <input
                  id="edit-username"
                  type="text"
                  value={editingAccount.username}
                  onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-email" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editingAccount.email}
                  onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                  className="input"
                  style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14 }}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-password" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                  New Password (leave blank to keep current)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="edit-password"
                    type={editingAccount.showPassword ? "text" : "password"}
                    value={editingAccount.password}
                    onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                    className="input"
                    style={{ width: "100%", background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "10px 48px 10px 12px", color: "var(--text-primary)", fontSize: 14 }}
                    placeholder="Enter new password to change"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingAccount({ ...editingAccount, showPassword: !editingAccount.showPassword })}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                    aria-label={editingAccount.showPassword ? "Hide password" : "Show password"}
                  >
                    {editingAccount.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {editingAccount.password && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Password must be 12+ characters with a number and symbol
                  </p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={16} style={{ color: editingAccount.canCreateEntries ? "#4ade80" : "#94a3b8" }} />
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                    Can Create Entries
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAccount({ ...editingAccount, canCreateEntries: !editingAccount.canCreateEntries })}
                  className="btn btn-secondary btn-sm"
                  aria-pressed={editingAccount.canCreateEntries}
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  {editingAccount.canCreateEntries ? "Yes" : "No"}
                </button>
              </div>

              {editFeedback && (
                <div style={{
                  padding: 10,
                  borderRadius: 8,
                  background: editFeedback.isError ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                  border: `1px solid ${editFeedback.isError ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
                  color: editFeedback.isError ? "#f87171" : "#34d399",
                  fontSize: 13,
                }}>
                  {editFeedback.message}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={updatingId !== null}
                  className="btn btn-secondary"
                  style={{ flex: 1, minHeight: 44 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId !== null}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: 44 }}
                >
                  {updatingId === editingAccount.account.id ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function AccountAccessManagement() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <UserManagementForm onCreated={() => setRefreshKey((current) => current + 1)} />
      <AccountAccessList refreshKey={refreshKey} />
    </>
  );
}

const AI_PROVIDERS: Array<{ value: AIProvider; label: string }> = [
  { value: "auto", label: "Auto-detect from key" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "groq", label: "Groq" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "mistral", label: "Mistral" },
  { value: "together", label: "Together AI" },
  { value: "fireworks", label: "Fireworks AI" },
  { value: "xai", label: "xAI" },
  { value: "cerebras", label: "Cerebras" },
  { value: "custom", label: "OpenAI-compatible endpoint" },
];

function AISettingsPanel() {
  const { config, updateConfig, clearApiKey } = useAIConfig();
  const [showKey, setShowKey] = useState(false);
  const { success } = useToast();

  return (
    <div className="settings-section">
      <div className="settings-section-title">AI Autofill &amp; Model Settings</div>
      <div className="settings-card">
        <div className="settings-row-title" style={{ marginBottom: 4 }}>Configure your AI provider</div>
        <div className="settings-row-desc" style={{ marginBottom: 16 }}>
          Your key is held in memory for this tab and sent only to this app&apos;s authenticated autofill endpoint, which forwards it to the selected provider. It is not saved in browser storage; reloads and sign-outs clear it. Source text is sent to your provider when you request a draft.
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label htmlFor="ai-provider" className="settings-row-title" style={{ display: "block", marginBottom: 6 }}>Provider</label>
            <select
              id="ai-provider"
              className="input"
              value={config.provider}
              onChange={(event) => {
                const provider = AI_PROVIDERS.find((option) => option.value === event.target.value);
                if (provider) updateConfig({ provider: provider.value });
              }}
              style={{ width: "100%", minHeight: 44 }}
            >
              {AI_PROVIDERS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            {config.provider === "auto" && (
              <p className="settings-row-desc" style={{ marginTop: 6 }}>
                Auto-detection uses recognizable key prefixes. If your provider uses a generic key format, choose it from the list instead.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ai-api-key" className="settings-row-title" style={{ display: "block", marginBottom: 6 }}>API key</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="ai-api-key"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                value={config.apiKey}
                onChange={(event) => updateConfig({ apiKey: event.target.value })}
                placeholder="Paste your provider API key"
                className="input"
                style={{ flex: 1, minWidth: 0 }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowKey((visible) => !visible)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                aria-pressed={showKey}
                style={{ minHeight: 44 }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {config.apiKey && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    clearApiKey();
                    success("API key cleared from this tab.");
                  }}
                  style={{ minHeight: 44 }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="ai-model" className="settings-row-title" style={{ display: "block", marginBottom: 6 }}>Model</label>
            <input
              id="ai-model"
              type="text"
              value={config.model}
              onChange={(event) => updateConfig({ model: event.target.value })}
              placeholder={config.provider === "gemini" ? "gemini-2.0-flash (default)" : "Enter the model ID from your provider"}
              maxLength={200}
              className="input"
              style={{ width: "100%" }}
            />
            <p className="settings-row-desc" style={{ marginTop: 6 }}>Enter an exact model ID enabled for your API key. Leave blank only to use the default Gemini model.</p>
          </div>

          {config.provider === "custom" && (
            <div>
              <label htmlFor="ai-endpoint" className="settings-row-title" style={{ display: "block", marginBottom: 6 }}>OpenAI-compatible HTTPS endpoint</label>
              <input
                id="ai-endpoint"
                type="url"
                value={config.endpoint}
                onChange={(event) => updateConfig({ endpoint: event.target.value })}
                placeholder="https://api.example.com/v1"
                maxLength={2_000}
                className="input"
                style={{ width: "100%" }}
              />
              <p className="settings-row-desc" style={{ marginTop: 6 }}>
                Must resolve to a public HTTPS host; local/private addresses and redirects are blocked. The chat-completions path is added automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsClient({ user, entryCount, isOwner }: SettingsClientProps) {
  const [exporting, setExporting] = useState(false);
  const [importingFile, setImportingFile] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { success, error: toastError } = useToast();
  const { clearApiKey } = useAIConfig();

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Ash";
  const avatarUrl = user.user_metadata?.avatar_url;
  const provider = user.app_metadata?.provider;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.error ?? "Could not export the library");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tech-utility-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success("Library export downloaded.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not export the library");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingFile(true);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Import file exceeds the 10 MB limit");
      }
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
      if (!res.ok) throw new Error(result.error ?? "Import failed");
      const importSummary = `Imported ${result.imported} entries and ${result.linksImported} links. Skipped ${result.skipped} entries/categories and ${result.linksSkipped} links.`;
      if (result.errors?.length) {
        toastError(`${importSummary} Some rows had errors: ${result.errors.slice(0, 3).join("; ")}`);
      } else {
        success(importSummary);
      }
      router.refresh();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to import — check that the file is a valid Tech-Utility JSON export.");
    } finally {
      setImportingFile(false);
      e.target.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (!user.email || deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()) return;
    setDeletingAccount(true);
    setDeleteError(null);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteEmail }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not delete the account");

      clearApiKey();
      let signOutFailed = false;
      try {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        signOutFailed = Boolean(error);
      } catch {
        signOutFailed = true;
      }
      router.replace(signOutFailed ? "/login?deleted=1&signout=failed" : "/login?deleted=1");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete the account");
      setDeletingAccount(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearApiKey();
      router.replace("/login");
    } catch {
      toastError("Could not sign out. Check your connection and try again.");
      setSigningOut(false);
    }
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
                <div className="settings-row-desc">Download all entries as JSON with fields, tags, links, and timestamps. Uploaded image files are not embedded and remain in this account&apos;s private Storage.</div>
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
                <div className="settings-row-desc">Import entries, categories, and links from a Tech-Utility backup (up to 5,000 entries / 10 MB). Duplicate entries are kept; matching categories are reused. Uploaded image files are not transferred.</div>
              </div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                {importingFile ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> : <Upload size={14} />}
                {importingFile ? "Reading…" : "Import JSON"}
                <input type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Delete account</div>
          <div className="settings-card">
            <div className="settings-row-title">Permanently delete your account and data</div>
            <div className="settings-row-desc" style={{ marginTop: 6 }}>
              This permanently deletes your Tech-Utility account, library data, and uploaded images.
              Export your library first if you may need it. This action cannot be undone.
              Provider backups may retain data according to their retention policies.
            </div>
            <label htmlFor="delete-account-email" className="settings-row-desc" style={{ display: "block", marginTop: 16 }}>
              Type {user.email ?? "your account email"} to confirm:
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <input
                id="delete-account-email"
                type="email"
                autoComplete="email"
                value={deleteEmail}
                onChange={(event) => setDeleteEmail(event.target.value)}
                disabled={deletingAccount}
                className="input"
                style={{ flex: "1 1 240px", minWidth: 0 }}
              />
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || !user.email || deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()}
              >
                {deletingAccount
                  ? <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
                  : <Trash2 size={14} />}
                {deletingAccount ? "Deleting account…" : "Delete account and data"}
              </button>
            </div>
            {deleteError && <p role="alert" style={{ color: "#f87171", marginTop: 10 }}>{deleteError}</p>}
          </div>
        </div>

        <AISettingsPanel />

        {/* Security */}
        <div className="settings-section">
          <div className="settings-section-title">Security</div>
          <div className="settings-card">
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Two-Factor Auth (TOTP)</div>
                <div className="settings-row-desc">
                  TOTP is not integrated into this app&apos;s sign-in flow. Do not rely on MFA enforcement until an in-app challenge is implemented.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Shield size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Manage in Supabase</span>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="settings-section">
            <div className="settings-section-title">Account Access & User Management</div>
            <div className="settings-card">
              <div className="settings-row">
                <div>
                  <div className="settings-row-title">Manage invited accounts</div>
                  <div className="settings-row-desc">
                    Create permanent or temporary email-and-password accounts, review their access, and renew expired temporary accounts.
                  </div>
                </div>
                <Link href="/users" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                  Open user accounts
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="settings-section">
          <div className="settings-section-title" style={{ color: "#f87171" }}>Danger Zone</div>
          <div className="settings-card" style={{ border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Sign Out</div>
                <div className="settings-row-desc">You will be redirected to the login page.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleSignOut} id="btn-sign-out" disabled={signingOut}>
                {signingOut ? "Signing out…" : "Sign Out"}
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
