# Ash-Tech — Project Progress & AI Agent Handoff Document

> **Last Updated:** October 2, 2026  
> **Repository:** [https://github.com/AshishCherian15/Ash-Tech](https://github.com/AshishCherian15/Ash-Tech)  
> **Status:** **Phases 1, 2, 3, 4, 5 Complete** (~90% Total Project Completion).

---

## 📌 Executive Project Summary

**Ash-Tech** is a private, login-gated personal knowledge memory app built for **Ashish Cherian**. It stores technical discoveries (tips, tricks, hacks, apps, tools, commands, extensions, prompts) with instant search, AI-assisted drafting, custom categories, soft delete, and guest account management.

---

## 🏗️ Completed Implementation Roadmap

### ✅ Phase 1: Security & Database Foundation (100% Complete)
- **Supabase DDL Schema**: Complete PostgreSQL tables (`entries`, `categories`, `tags`, `entry_tags`, `entry_versions`, `usage_events`) in [`database/schema.sql`](./database/schema.sql).
- **Row Level Security (RLS)**: Enforced on all tables with `auth.uid() = user_id`.
- **Edge Auth Guard**: Next.js Edge Middleware ([`src/middleware.ts`](./src/middleware.ts)) managing session cookies and route protection.

### ✅ Phase 2: Core Library & Data Loop (100% Complete)
- **CRUD Operations**: Complete creation, editing, detail view, and deletion of entries.
- **Categories & Tags**: Custom categories with icons/colors and autocomplete tagging.
- **Trash Bin**: 30-day soft-delete system (`deleted_at` timestamp with restore & purge).
- **JSON Export & Import**: Full backup download (`/api/export`) and JSON restore (`/api/import`).

### ✅ Phase 3: UI/UX & Navigation (100% Complete)
- **Collapsible Sidebar**: Expandable/collapsible navigation panel with floating `<PanelLeftClose>` toggle button in [`src/components/ShellLayout.tsx`](./src/components/ShellLayout.tsx).
- **Xiaomi Notes-Style Card Previews**: Highlighting image header previews for visual entries in [`src/components/EntryCard.tsx`](./src/components/EntryCard.tsx).
- **Command Palette**: `Ctrl + K` global keyboard shortcut modal in [`src/components/CommandPalette.tsx`](./src/components/CommandPalette.tsx).
- **Toast Notifications**: Multi-variant notification system (success, error, info, warning, AI).
- **Branding**: Official 48x48px logo integration across login and sidebar headers.

### ✅ Phase 4: AI Autofill & Model Engine (100% Complete)
- **Dual AI Engine**: Server route [`/api/autofill/route.ts`](./src/app/api/autofill/route.ts) supporting **Groq (Llama 3.3 70B)** as primary and **Google Gemini (1.5 Flash)** as fallback.
- **Settings AI Model Manager**: Model provider toggles, custom API key overrides, and **👁️ Reveal / Hide Key** buttons in [`src/components/SettingsClient.tsx`](./src/components/SettingsClient.tsx).
- **Strict Guardrails**: Extraction-only system prompt (no invented URLs, no auto-saving without owner review).

### ✅ Phase 5: Account Access & Compliance (100% Complete)
- **Guest Account Creation**: Endpoint [`/api/users/create/route.ts`](./src/app/api/users/create/route.ts) for provisioning guest users with custom username and password.
- **Session Duration Expiration**: Selection for guest account expirations (`1 Hour`, `24 Hours`, `7 Days`, `30 Days`).
- **Privacy & DPDP Compliance**: `robots.txt` (`Disallow: /`), `noindex, nofollow` metadata, zero third-party telemetry.

---

## 📂 Key File Locations

| Component / Function | File Path |
|---|---|
| **Edge Auth Middleware** | [`src/middleware.ts`](./src/middleware.ts) |
| **Proxy Route Guard** | [`src/proxy.ts`](./src/proxy.ts) |
| **App Layout Shell** | [`src/components/ShellLayout.tsx`](./src/components/ShellLayout.tsx) |
| **Sidebar Component** | [`src/components/Sidebar.tsx`](./src/components/Sidebar.tsx) |
| **Dashboard Client** | [`src/components/DashboardClient.tsx`](./src/components/DashboardClient.tsx) |
| **Entry Card UI** | [`src/components/EntryCard.tsx`](./src/components/EntryCard.tsx) |
| **Login Page** | [`src/app/login/page.tsx`](./src/app/login/page.tsx) |
| **Settings Client** | [`src/components/SettingsClient.tsx`](./src/components/SettingsClient.tsx) |
| **AI Autofill API** | [`src/app/api/autofill/route.ts`](./src/app/api/autofill/route.ts) |
| **User Creation API** | [`src/app/api/users/create/route.ts`](./src/app/api/users/create/route.ts) |
| **Database DDL** | [`database/schema.sql`](./database/schema.sql) |
| **Sample Seed Data** | [`database/seed_sample_entries.sql`](./database/seed_sample_entries.sql) |

---

## 🚀 Recommended Future Extensions (Phases 6 & 7)

For any future AI agent or developer continuing this project:

1. **Background Link Health Checker**:
   - Create a cron API route `/api/cron/check-links` that runs weekly to verify `url` status codes and flag broken links in entries.
2. **Per-Entry Version History Diff**:
   - Wire the existing `entry_versions` table to show a visual diff when an entry is edited multiple times.
3. **Chrome / Firefox Extension (Phase 7)**:
   - Create a Manifest V3 web extension in a `/extension` directory that sends `window.location` and highlighted text to `/api/autofill`.

---

## 🛠️ How to Resume Work as an AI Agent

1. **Check local dev server**:
   ```bash
   cd app
   npm run dev
   ```
2. **Verify production build**:
   ```bash
   npm run build
   ```
3. **Deploy to Vercel / Git**:
   ```bash
   git add .
   git commit -m "your update message"
   git push origin main
   ```
