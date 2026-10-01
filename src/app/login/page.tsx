"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GitBranch, Globe, Zap, Shield, Search, Database } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [authMode, setAuthMode] = useState<"oauth" | "email">("oauth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("email" as any);
    setError(null);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(null);
      } else {
        alert("Account created successfully! Logging you in...");
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) setError(loginErr.message);
        else window.location.href = "/dashboard";
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(null);
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const signIn = async (provider: "google" | "github") => {
    setLoading(provider);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
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

      <div className="login-container">
        {/* Logo & brand */}
        <div className="login-brand">
          <div className="login-logo">
            <span className="login-logo-letter">A</span>
            <div className="login-logo-circuit">
              <span /><span /><span />
            </div>
          </div>
          <div className="login-brand-text">
            <h1 className="login-title">Ash-Tech</h1>
            <p className="login-tagline">Your private tech memory</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access your knowledge base</p>
          </div>

          {error && (
            <div className="login-error">
              <Shield size={14} />
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => setAuthMode("oauth")}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: authMode === "oauth" ? "var(--bg-card)" : "transparent",
                color: authMode === "oauth" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              OAuth Login
            </button>
            <button
              onClick={() => setAuthMode("email")}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: authMode === "email" ? "var(--bg-card)" : "transparent",
                color: authMode === "email" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              Email & Password
            </button>
          </div>

          {authMode === "email" ? (
            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14,
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, background: "var(--bg-base)",
                  border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14,
                }}
              />
              <button
                type="submit"
                disabled={!!loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "12px", borderRadius: 10, marginTop: 4, fontWeight: 600 }}
              >
                {loading === ("email" as any) ? (isSignUp ? "Creating Account..." : "Signing in...") : (isSignUp ? "Create Account & Sign In" : "Sign In with Password")}
              </button>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ background: "none", border: "none", color: "var(--brand-blue-bright)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
                >
                  {isSignUp ? "Already have an account? Sign In" : "First time logging in? Create account"}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-buttons">
              <button
                id="btn-sign-in-google"
                className="login-btn login-btn-google"
                onClick={() => signIn("google")}
                disabled={!!loading}
              >
                {loading === "google" ? (
                  <div className="login-spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <button
                id="btn-sign-in-github"
                className="login-btn login-btn-github"
                onClick={() => signIn("github")}
                disabled={!!loading}
              >
                {loading === "github" ? (
                  <div className="login-spinner" />
                ) : (
                  <GitBranch size={18} />
                )}
                Continue with GitHub
              </button>
            </div>
          )}

          <div className="login-divider">
            <span>Private access only</span>
          </div>

          <div className="login-features">
            <div className="login-feature">
              <Search size={14} />
              <span>Instant search across all entries</span>
            </div>
            <div className="login-feature">
              <Database size={14} />
              <span>Structured knowledge base</span>
            </div>
            <div className="login-feature">
              <Zap size={14} />
              <span>AI-assisted entry drafting</span>
            </div>
            <div className="login-feature">
              <Shield size={14} />
              <span>Private, owner-only access</span>
            </div>
          </div>
        </div>

        <p className="login-footer">
          No public sign-up · Personal tool by Ash
        </p>
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

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
        }

        .login-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 0 30px rgba(59,130,246,0.5);
          flex-shrink: 0;
        }

        .login-logo-letter {
          font-size: 28px;
          font-weight: 800;
          color: white;
          font-family: 'Inter', sans-serif;
          line-height: 1;
          letter-spacing: -1px;
        }

        .login-logo-circuit {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .login-logo-circuit span {
          display: block;
          height: 2px;
          border-radius: 2px;
          background: rgba(255,255,255,0.6);
        }

        .login-logo-circuit span:nth-child(1) { width: 12px; }
        .login-logo-circuit span:nth-child(2) { width: 8px; }
        .login-logo-circuit span:nth-child(3) { width: 10px; }

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
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          width: 100%;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-btn-google {
          background: #fff;
          color: #1a1a1a;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }

        .login-btn-google:hover:not(:disabled) {
          background: #f8f9fa;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          transform: translateY(-1px);
        }

        .login-btn-github {
          background: #24292e;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .login-btn-github:hover:not(:disabled) {
          background: #2d333b;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transform: translateY(-1px);
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

        .login-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .login-feature svg {
          color: var(--brand-blue-bright);
          flex-shrink: 0;
        }

        .login-footer {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
