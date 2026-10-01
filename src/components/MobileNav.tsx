"use client";

import { useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Menu, X, Plus, LayoutDashboard, FolderOpen, Trash2, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface MobileNavProps {
  user: User;
}

export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Ash";

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-logo">
          <div className="mobile-logo-icon"><span>A</span></div>
          <span className="mobile-logo-text">Ash-Tech</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/entries/new" className="btn btn-primary btn-sm">
            <Plus size={14} />
            Add
          </Link>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="mobile-drawer-overlay" onClick={() => setOpen(false)}>
          <nav className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 600, fontSize: 16 }}>Menu</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mobile-drawer-links">
              {[
                { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                { href: "/categories", icon: FolderOpen, label: "Categories" },
                { href: "/trash", icon: Trash2, label: "Trash" },
                { href: "/settings", icon: Settings, label: "Settings" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="sidebar-nav-item"
                  onClick={() => setOpen(false)}
                  style={{ fontSize: 15, padding: "12px 8px" }}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mobile-drawer-user">
              <div className="sidebar-user-name">{name}</div>
              <div className="sidebar-user-email">{user.email}</div>
              <button onClick={handleSignOut} className="btn btn-danger btn-sm" style={{ marginTop: 12 }}>
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        .mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-sidebar);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-logo-icon span {
          font-size: 16px;
          font-weight: 800;
          color: white;
        }

        .mobile-logo-text {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 200;
          backdrop-filter: blur(4px);
        }

        .mobile-drawer {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 260px;
          background: var(--bg-sidebar);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 16px;
          animation: slideInRight 0.2s ease-out;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .mobile-drawer-user {
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
}
