"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 12 || password.length > 128 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Use 12–128 characters, including at least one number and one symbol.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError("The password could not be updated. The recovery link may have expired; request a new one.");
        return;
      }

      setMessage("Your password has been updated.");
      window.setTimeout(() => router.replace("/dashboard"), 1200);
    } catch {
      setError("The password could not be updated. The recovery link may have expired; request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="legal-page" aria-labelledby="reset-password-title">
      <h1 id="reset-password-title">Choose a new password</h1>
      <p>Use at least 12 characters, including a number and a symbol.</p>
      <form onSubmit={updatePassword} style={{ display: "grid", gap: 12, maxWidth: 440, marginTop: 24 }}>
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ minHeight: 48, padding: "12px 14px", borderRadius: 10, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        />
        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          maxLength={128}
          required
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          style={{ minHeight: 48, padding: "12px 14px", borderRadius: 10, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        />
        {error && <p role="alert" aria-live="assertive" style={{ color: "var(--text-error, #f87171)" }}>{error}</p>}
        {message && <p role="status" aria-live="polite">{message}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ minHeight: 48 }}>
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
      <p style={{ marginTop: 20 }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </main>
  );
}
