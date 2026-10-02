"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AppShellClient from "@/components/AppShellClient";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Entry } from "@/lib/types";

interface ShellLayoutProps {
  user: User;
  entries: Partial<Entry>[];
  children: React.ReactNode;
}

export default function ShellLayout({ user, entries, children }: ShellLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      <div className={sidebarOpen ? "" : "sidebar-collapsed"}>
        <Sidebar user={user} />
      </div>

      <div className="main-content" style={{ position: "relative" }}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost btn-icon"
          style={{
            position: "fixed",
            top: 14,
            left: sidebarOpen ? 272 : 16,
            zIndex: 99,
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: 10,
            padding: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
          }}
          data-tooltip={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <MobileNav user={user} />
        <main style={{ flex: 1, minWidth: 0, paddingTop: 10 }}>
          {children}
        </main>
      </div>

      <AppShellClient entries={entries} />
    </div>
  );
}
