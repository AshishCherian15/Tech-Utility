import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { ArrowRight, Search, Zap, Shield, Sparkles, FolderOpen, Tag, Code2, Globe } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="home-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <BrandMark size={32} />
            <span className="nav-title">ByteShelf</span>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-secondary nav-login">Sign In</Link>
            <Link href="/login" className="btn btn-primary nav-signup">Sign Up <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-bg">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-grid" />
          </div>
          
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>Your Personal Knowledge Base</span>
            </div>
            
            <h1 className="hero-title">
              Your shelf of <span className="text-gradient">useful tech</span>
            </h1>
            
            <p className="hero-subtitle">
              A searchable, growing library of useful tech tools, tips, websites, apps, commands, and learning resources — discovered once, explained clearly, kept up to date.
            </p>
            
            <div className="hero-cta">
              <Link href="/login" className="btn btn-primary hero-btn-main">
                Start Building Your Shelf <ArrowRight size={20} />
              </Link>
              <Link href="#features" className="btn btn-secondary hero-btn-alt">
                Explore Features
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">⚡</span>
                <span className="stat-label">Lightning Fast</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">🔒</span>
                <span className="stat-label">Fully Private</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">🤖</span>
                <span className="stat-label">AI Assisted</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="features-header">
            <h2>Everything you need to stay organized</h2>
            <p>ByteShelf is built for developers, designers, and tech enthusiasts who want to stop losing their favorite tools in endless browser bookmarks.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Globe className="feature-icon" size={24} /></div>
              <h3>Save Anything</h3>
              <p>Store useful websites, web apps, API docs, and repositories with a single click.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Search className="feature-icon" size={24} /></div>
              <h3>Instant Search</h3>
              <p>Find exactly what you need in milliseconds. No more digging through folders.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FolderOpen className="feature-icon" size={24} /></div>
              <h3>Smart Categories</h3>
              <p>Organize your knowledge logically. Group similar tools together effortlessly.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Tag className="feature-icon" size={24} /></div>
              <h3>Tags & Metadata</h3>
              <p>Add rich context to your saves so you always remember why a tool is useful.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Zap className="feature-icon" size={24} /></div>
              <h3>AI Extraction</h3>
              <p>Automatically extract titles, descriptions, and tags directly from URLs.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Code2 className="feature-icon" size={24} /></div>
              <h3>Code Snippets</h3>
              <p>Save those terminal commands and config snippets you always end up Googling.</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="cta-section">
          <div className="cta-box">
            <h2>Ready to declutter your tech life?</h2>
            <p>Join ByteShelf and build a private, permanent home for your digital tools.</p>
            <Link href="/login" className="btn btn-primary cta-btn">
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BrandMark size={24} />
            <span>ByteShelf</span>
          </div>
          <div className="footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} ByteShelf. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: var(--bg-base);
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .home-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-login {
          background: transparent;
          border-color: transparent;
        }

        .nav-login:hover {
          background: var(--bg-card-hover);
        }

        .nav-signup {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-weight: 600;
        }

        .home-main {
          flex: 1;
          padding-top: 72px;
        }

        .hero-section {
          position: relative;
          padding: 120px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 72px);
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .hero-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation: float 12s ease-in-out infinite;
        }

        .hero-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);
          bottom: -100px;
          right: -200px;
          animation: float 15s ease-in-out infinite reverse;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 100px;
          color: var(--brand-blue-bright);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 32px;
          animation: fade-up 0.5s ease-out;
        }

        .badge-icon {
          color: #60a5fa;
        }

        .hero-title {
          font-size: clamp(48px, 8vw, 80px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          color: var(--text-primary);
          margin-bottom: 24px;
          animation: fade-up 0.6s ease-out 0.1s both;
        }

        .text-gradient {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(18px, 2.5vw, 22px);
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 640px;
          margin-bottom: 48px;
          animation: fade-up 0.7s ease-out 0.2s both;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          margin-bottom: 64px;
          animation: fade-up 0.8s ease-out 0.3s both;
        }

        .hero-btn-main {
          font-size: 16px;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 12px;
        }

        .hero-btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59,130,246,0.3);
        }

        .hero-btn-alt {
          font-size: 16px;
          padding: 16px 32px;
          border-radius: 12px;
        }

        .hero-stats {
          display: flex;
          gap: 40px;
          animation: fade-up 0.9s ease-out 0.4s both;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-value {
          font-size: 24px;
        }

        .stat-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .features-section {
          padding: 120px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-header {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 64px;
        }

        .features-header h2 {
          font-size: 40px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -1px;
          margin-bottom: 20px;
        }

        .features-header p {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          padding: 32px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-elevated);
        }

        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: var(--brand-blue-bright);
          margin-bottom: 24px;
        }

        .feature-card h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .cta-section {
          padding: 60px 24px 120px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .cta-box {
          background: linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8));
          border: 1px solid var(--border-card);
          border-radius: 32px;
          padding: 64px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .cta-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(59,130,246,0.1), transparent 60%);
          pointer-events: none;
        }

        .cta-box h2 {
          font-size: 36px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -1px;
          margin-bottom: 16px;
          position: relative;
        }

        .cta-box p {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 500px;
          position: relative;
        }

        .cta-btn {
          font-size: 16px;
          padding: 16px 36px;
          border-radius: 12px;
          position: relative;
        }

        .home-footer {
          border-top: 1px solid var(--border-subtle);
          padding: 48px 24px;
          background: rgba(10, 10, 10, 0.3);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: var(--text-muted);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: var(--text-primary);
        }

        .footer-copyright {
          font-size: 13px;
          color: var(--text-muted);
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-cta {
            flex-direction: column;
            width: 100%;
          }
          .hero-stats {
            flex-direction: column;
            gap: 16px;
          }
          .features-header h2 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
