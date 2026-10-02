"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  FolderOpen,
  Trash2,
  Settings,
  Plus,
  Zap,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: User;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/categories", icon: FolderOpen, label: "Categories" },
  { href: "/trash", icon: Trash2, label: "Trash" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const quickLinks = [
  { href: "/favorites", icon: Star, label: "Favorites" },
  { href: "/dashboard?filter=recent", icon: Clock, label: "Recently Viewed" },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Ash";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ padding: 2, background: "transparent", boxShadow: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ash-Tech Logo" style={{ width: "100%", height: "100%", borderRadius: 8, objectFit: "contain" }} />
        </div>
        <div>
          <div className="sidebar-logo-name">Ash-Tech</div>
          <div className="sidebar-logo-sub">Tech Memory</div>
        </div>
      </div>

      {/* Add button */}
      <div style={{ padding: "0 12px 16px" }}>
        <Link href="/entries/new" className="btn btn-primary" style={{ width: "100%", borderRadius: "10px" }}>
          <Plus size={16} />
          New Entry
        </Link>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label">Navigation</div>
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-nav-item", pathname === href && "sidebar-nav-item-active")}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        <div className="sidebar-nav-section">
          <div className="sidebar-nav-label">Quick Access</div>
          {quickLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="sidebar-nav-item"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* AI Badge */}
      <div style={{ padding: "0 12px 12px" }}>
        <div className="sidebar-ai-badge">
          <Zap size={13} />
          <span>AI autofill ready</span>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} width={32} height={32} style={{ borderRadius: "50%" }} />
          ) : (
            <span>{name[0].toUpperCase()}</span>
          )}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{name}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-icon"
          data-tooltip="Sign out"
          style={{ marginLeft: "auto", flexShrink: 0, fontSize: 12, color: "var(--text-muted)" }}
          aria-label="Sign out"
        >
          ↩
        </button>
      </div>

      <style>{`
        .sidebar-logo {
          padding: 20px 16px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 12px;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(59,130,246,0.4);
          flex-shrink: 0;
        }

        .sidebar-logo-icon span {
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .sidebar-logo-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .sidebar-logo-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .sidebar-nav {
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-nav-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-nav-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0 8px;
          margin-bottom: 4px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13.5px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s ease;
          font-weight: 450;
        }

        .sidebar-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }

        .sidebar-nav-item-active {
          background: rgba(59,130,246,0.15);
          color: var(--brand-blue-bright);
          font-weight: 500;
        }

        .sidebar-nav-item-active svg {
          color: var(--brand-blue-bright);
        }

        .sidebar-ai-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 11.5px;
          color: var(--brand-blue-bright);
          font-weight: 500;
        }

        .sidebar-user {
          padding: 12px 16px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }

        .sidebar-user-info {
          min-width: 0;
          flex: 1;
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </aside>
  );
}
