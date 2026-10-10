"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AppShellClient from "@/components/AppShellClient";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { Entry } from "@/lib/types";

interface ShellLayoutProps {
  user: User | null;
  entries: Partial<Entry>[];
  children: React.ReactNode;
  isOwner: boolean;
  userRole: string;
}

export default function ShellLayout({ user, entries, children, isOwner, userRole }: ShellLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileDrawerOpen]);

  // Touch handling for edge swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return; // Only on mobile
    const x = e.touches[0].clientX;
    if (x <= 24) {
      setTouchStartX(x);
      setTouchCurrentX(x);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const x = e.touches[0].clientX;
    setTouchCurrentX(x);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchCurrentX === null) return;
    const deltaX = touchCurrentX - touchStartX;
    if (deltaX > 50) {
      setMobileDrawerOpen(true);
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  return (
    <div className="app-shell" style={{ position: "relative" }}>
      {/* Desktop Sidebar */}
      <div className={sidebarOpen ? "" : "sidebar-collapsed"} style={{ display: isMobile ? "none" : "block" }}>
        <Sidebar user={user} isOwner={isOwner} userRole={userRole} />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
            backdropFilter: "blur(4px)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-card)",
          zIndex: 50,
          transform: mobileDrawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: isMobile ? "block" : "none",
        }}
      >
        <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Menu</span>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="btn btn-ghost btn-icon"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <Sidebar user={user} isOwner={isOwner} userRole={userRole} />
      </div>

      <div
        ref={mainContentRef}
        className="main-content"
        style={{ position: "relative" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-icon sidebar-toggle"
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
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="btn btn-ghost btn-icon"
            style={{
              position: "fixed",
              top: 14,
              left: 16,
              zIndex: 35,
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
              borderRadius: 10,
              padding: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            aria-label="Open menu"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <MobileNav user={user} isOwner={isOwner} userRole={userRole} />
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <main id="main-content" tabIndex={-1} style={{ flex: 1, minWidth: 0, paddingTop: 10 }}>
          {children}
        </main>
      </div>

      <AppShellClient entries={entries} />
    </div>
  );
}
