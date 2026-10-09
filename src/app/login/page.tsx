"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Zap, Shield, Search, Eye, EyeOff } from "lucide-react";
import BrandMark from "@/components/BrandMark";

function getSafeReturnPath(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/dashboard";
  }

  try {
    const target = new URL(value, "https://byteshelf.invalid");
    if (target.origin !== "https://byteshelf.invalid") return "/dashboard";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; signout?: string; next?: string }>;
}) {
  const { error: queryError, deleted, signout, next } = use(searchParams);
  const returnPath = getSafeReturnPath(next);
  const [loading, setLoading] = useState<"email" | "google" | "github" | "reset" | "signout" | null>(null);
  const [error, setError] = useState<string | null>(
    queryError === "recovery"
      ? "That recovery link is invalid or expired. Request a new password reset link."
      : queryError === "account_inactive"
        ? "This account is disabled or has expired. Contact the owner to restore access, or sign in with another account."
        : queryError === "not_provisioned"
          ? "This account has not been approved for ByteShelf. Contact the owner or switch to an account they provisioned."
          : queryError === "oauth"
            ? "Sign-in with your provider did not complete. Please try again or use another sign-in method."
          : null
  );
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const accountDeletedNotice = deleted === "1"
    ? signout === "failed"
      ? "Your ByteShelf account and library data were deleted. Local sign-out may not have completed; close this tab."
      : "Your ByteShelf account and library data were deleted."
    : null;
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"oauth" | "email">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.replace(returnPath);
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email");
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError("An account with this email already exists. Please sign in instead.");
        return;
      }

      setRecoveryNotice("Check your email for the confirmation link to complete sign up.");
    } catch {
      setError("Sign-up failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const requestPasswordReset = async () => {
    setError(null);
    setRecoveryNotice(null);
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setLoading("reset");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
      });
      if (error) {
        setError("We couldn't confirm the recovery request. Please try again later.");
        return;
      }
      setRecoveryNotice(
        "If an eligible account uses this email, password recovery instructions will be sent."
      );
    } catch {
      setError("We couldn't confirm the recovery request. Check your connection and try again.");
    } finally {
      setLoading(null);
    }
  };

  const switchAccount = async () => {
    setLoading("signout");
    setError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      setError("Signed out. Choose an account provisioned by the owner.");
      router.refresh();
    } catch {
      setError("Could not sign out. Close this tab or try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-split">
        {/* Left Side: Brand and Info */}
        <div className="login-info">
          <div className="login-logo-container">
            <BrandMark size={64} />
          </div>
          <h1 className="login-hero-title">ByteShelf</h1>
          <p className="login-hero-subtitle">
            Your searchable shared tech library. Built for saving tips, tricks, tools, and commands the community should not have to rediscover.
          </p>

          <div className="login-features-list">
            <div className="login-feature-item">
              <div className="login-feature-icon"><Search size={20} /></div>
              <div className="login-feature-text">
                <h3>Instant Search</h3>
                <p>Find your saved tech knowledge in milliseconds.</p>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><Zap size={20} /></div>
              <div className="login-feature-text">
                <h3>AI-Assisted</h3>
                <p>Auto-extract details and tags from URLs and content.</p>
              </div>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><Shield size={20} /></div>
              <div className="login-feature-text">
                <h3>Private & Secure</h3>
                <p>Login-gated access with Row Level Security.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <main className="login-container">

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your knowledge base</p>
          </div>

          {error && (
            <div className="login-error" role="alert" aria-live="assertive">
              <Shield size={14} />
              {error}
            </div>
          )}
          {(queryError === "not_provisioned" || queryError === "account_inactive") && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={switchAccount}
              disabled={!!loading}
              style={{ width: "100%", minHeight: 44, marginBottom: 16 }}
            >
              {loading === "signout" ? "Signing out…" : "Sign out and switch account"}
            </button>
          )}
          {accountDeletedNotice && (
            <p role="status" aria-live="polite" style={{ marginBottom: 16, color: "var(--text-secondary)" }}>
              {accountDeletedNotice}
            </p>
          )}
          {recoveryNotice && (
            <p role="status" aria-live="polite" style={{ marginBottom: 16, color: "var(--text-secondary)" }}>
              {recoveryNotice}
            </p>
          )}

          {/* Mode Switcher */}
          <div role="group" aria-label="Sign-in method" style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10 }}>
            <button
              type="button"
              onClick={() => { setAuthMode("email"); setError(null); setRecoveryNotice(null); }}
              aria-pressed={authMode === "email"}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: authMode === "email" ? "var(--bg-card)" : "transparent",
                color: authMode === "email" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("oauth"); setError(null); setRecoveryNotice(null); }}
              aria-pressed={authMode === "oauth"}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: authMode === "oauth" ? "var(--bg-card)" : "transparent",
                color: authMode === "oauth" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === "email" ? handleEmailAuth : handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                id="login-email"
                type="email"
                placeholder="Your Email"
                aria-label="Email address"
                autoComplete="username"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14,
                }}
              />
              <div className="login-password-field">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete={authMode === "email" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={!!loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", borderRadius: 10, marginTop: 4, fontWeight: 600 }}
              >
                {loading === "email" ? (authMode === "email" ? "Signing in…" : "Signing up…") : (authMode === "email" ? "Sign in" : "Sign up")}
              </button>
              {authMode === "email" && (
                <button
                  type="button"
                  className="btn"
                  disabled={!!loading}
                  onClick={requestPasswordReset}
                  style={{ minHeight: 44, color: "var(--text-accent)" }}
                >
                  {loading === "reset" ? "Sending instructions..." : "Forgot password?"}
                </button>
              )}
            </form>

          <div className="login-divider">
            <span>Contributor Access</span>
          </div>

          <p className="login-footer" style={{ marginTop: 0 }}>
            Sign up to contribute to ByteShelf
          </p>
        </div>

        <nav className="login-legal-links" aria-label="Legal information" style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
          <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}>Cookies</Link>
        </nav>
      </main>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }

        .login-bg-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%);
          top: -200px;
          left: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .login-bg-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%);
          bottom: -150px;
          right: -100px;
          animation: float 10s ease-in-out infinite reverse;
        }

        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .login-split {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 960px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 64px;
          align-items: center;
        }

        @media (max-width: 860px) {
          .login-split {
            grid-template-columns: 1fr;
            max-width: 420px;
            gap: 32px;
          }
          .login-info {
            align-items: center;
            text-align: center;
          }
          .login-features-list {
            display: none !important;
          }
          .login-hero-subtitle {
            margin-bottom: 0 !important;
          }
        }

        .login-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-logo-container {
          margin-bottom: 8px;
        }

        .login-hero-title {
          font-size: 48px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .login-hero-subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 420px;
          margin-bottom: 32px;
        }

        .login-features-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .login-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--brand-blue-bright);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .login-feature-text h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .login-feature-text p {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
        }

        .login-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .login-password-field {
          position: relative;
        }

        .login-password-field input {
          width: 100%;
          padding: 12px 48px 12px 14px;
          border-radius: 10px;
          background: var(--bg-base);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          font-size: 14px;
        }

        .login-password-toggle {
          position: absolute;
          top: 50%;
          right: 7px;
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          transform: translateY(-50%);
          border: 0;
          border-radius: 8px;
          color: var(--text-muted);
          background: transparent;
          cursor: pointer;
        }

        .login-password-toggle:hover {
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }

        .login-brand-text h1 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .login-tagline {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .login-card {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 20px;
          padding: 32px;
          box-shadow: var(--shadow-elevated), 0 0 60px rgba(59,130,246,0.06);
        }

        .login-card-header {
          margin-bottom: 28px;
          text-align: center;
        }

        .login-card-header h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .login-card-header p {
          font-size: 14px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #f87171;
          margin-bottom: 16px;
        }

        .login-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          width: 100%;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
          color: var(--text-muted);
          font-size: 12px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .login-footer {
          font-size: 13px;
          color: var(--text-muted);
          text-align: center;
        }
        
        .login-legal-links a:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
