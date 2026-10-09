"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Menu, X, Plus, LayoutDashboard, FolderOpen, Trash2, Settings, Users, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import BrandMark from "@/components/BrandMark";

interface MobileNavProps {
  user: User | null;
  isOwner: boolean;
  userRole: string;
}

export default function MobileNav({ user, isOwner, userRole }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { error: toastError } = useToast();

  useEffect(() => {
    if (!open) return;

    const openerButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerButton?.focus();
    };
  }, [open]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toastError("Could not sign out. Please try again.");
        return;
      }
      router.replace("/login");
    } catch {
      toastError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const canModerate = isOwner || userRole === "MODERATOR" || userRole === "ADMIN";

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/categories", icon: FolderOpen, label: "Categories" },
    ...(user ? [{ href: "/trash", icon: Trash2, label: "Trash" }] : []),
    ...(canModerate ? [{ href: "/review-queue", icon: ClipboardCheck, label: "Review Queue" }] : []),
    ...(isOwner ? [{ href: "/users", icon: Users, label: "User accounts" }] : []),
    ...(user ? [{ href: "/settings", icon: Settings, label: "Settings" }] : []),
  ];

  return (
    <>
      <header className="mobile-header">
        <div className="mobile-logo">
          <BrandMark size={28} />
          <span className="mobile-logo-text">ByteShelf</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/entries/new" className="btn btn-primary btn-sm">
            <Plus size={14} aria-hidden="true" />
            Add
          </Link>
          <button
            ref={menuButtonRef}
            className="btn btn-ghost btn-icon"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? "mobile-navigation-dialog" : undefined}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="mobile-drawer-overlay" onClick={() => setOpen(false)}>
          <nav
            id="mobile-navigation-dialog"
            ref={drawerRef}
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={e => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 600, fontSize: 16 }}>Menu</span>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="mobile-drawer-links">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="sidebar-nav-item"
                  onClick={() => setOpen(false)}
                  aria-label={label}
                  style={{ fontSize: 15, padding: "12px 8px" }}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="mobile-drawer-user">
              {user ? (
                <>
                  <div className="sidebar-user-name">{name}</div>
                  <div className="sidebar-user-email">{user.email}</div>
                  <button type="button" onClick={handleSignOut} disabled={signingOut} aria-busy={signingOut} className="btn btn-danger" style={{ marginTop: 12 }}>
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-secondary" onClick={() => setOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                  Sign In
                </Link>
              )}
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

        @media (prefers-reduced-motion: reduce) {
          .mobile-drawer {
            animation: none;
          }
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
