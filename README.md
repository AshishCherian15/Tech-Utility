# Ash-Tech

<div align="center">
  <img src="https://raw.githubusercontent.com/AshishCherian15/Ash-Tech/main/public/logo.png" alt="Ash-Tech Logo" width="200" />
  
  **Your private, searchable tech memory.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
</div>

---

## What is Ash-Tech?

Ash-Tech is a private, login-protected personal knowledge base for **tips, tricks, hacks, apps, websites, tools, commands, extensions, guides and prompts** — the things you find once, forget you saved, and end up Googling again.

**One search box. One place. Built for a single owner.**

> **Name origin:** **Ash** (owner's name) + **Tech** (what it's about). Short, easy to say, easy to remember.

---

## Complete Features

### 🔐 Auth & Security
- **Google OAuth & Email/Password Sign-In**: Login with Google or register/login with custom credentials.
- **Guest / Temporary User Access Management**: Provision secondary guest accounts directly from Settings with custom username, password, and session duration expirations (`1 Hour`, `24 Hours`, `7 Days`, `30 Days`).
- **Database Row Level Security (RLS)**: Enforced at the Supabase kernel level (`auth.uid() = user_id`) on all 7 database tables.
- **Privacy & Indian DPDP Act 2023 Compliance**: Zero third-party telemetry, explicit `robots.txt` (`Disallow: /`), and `noindex, nofollow` metadata.

### 🤖 AI Engine & Model Settings
- **Dual LLM Provider Engine**: Supports **Groq (Llama 3.3 70B Versatile)** as primary and **Google Gemini (1.5 Flash)** as fallback.
- **Settings AI Model Manager**: Model selector buttons and **👁️ Reveal / Hide API Key** input fields stored safely in client environment/localStorage.
- **Strict Human-in-the-Loop Review**: AI drafts entry fields but **never auto-saves** without owner review.

### 🎨 Visual & Desktop UX
- **Collapsible Side Navigation Panel**: Floating expand/collapse button (`<PanelLeftClose>` / `<PanelLeftOpen>`) for full-screen entry browsing.
- **Official Brand Logo**: Prominently displayed 48x48px official logo in the sidebar header and login screens.
- **Xiaomi Notes-Style Card Previews**: Masonry & grid cards showcase top header image previews for entries with attached screenshots or site links.
- **Global Command Palette (`Ctrl + K`)**: Keyboard-driven navigation and search across all entries.
- **Toast Notifications System**: Slide-up feedback toasts for success, error, info, warning, and AI events.

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Custom Vanilla CSS Tokens (`globals.css`) · Glassmorphism · Smooth Animations |
| **Backend** | Next.js Serverless API Routes · Edge Middleware (`src/middleware.ts`) |
| **Database** | Supabase Postgres (with RLS on every table) |
| **Auth** | Supabase Auth — Google OAuth + Email/Password + TOTP 2FA |
| **AI LLM** | Groq (Llama 3.3 70B) & Google Gemini 1.5 Flash |
| **Hosting** | Vercel Serverless |

---

## Project Structure

```
app/
├── database/
│   ├── schema.sql              # Full Supabase schema + RLS policies
│   └── seed_sample_entries.sql # Seed script for CodeFronts & Windows Clipboard
├── public/
│   ├── logo.png                # Official Ash-Tech brand logo
│   ├── CodeFronts.com.png      # Sample entry preview image
│   ├── icon-192.png            # PWA 192px app icon
│   ├── icon-512.png            # PWA 512px app icon
│   ├── manifest.json           # Installable PWA manifest
│   └── robots.txt              # Privacy robots.txt (Disallow: /)
├── src/
│   ├── app/
│   │   ├── (app)/              # Auth-protected app shell (Dashboard, Entries, Categories, Trash, Settings)
│   │   ├── api/                # API routes (autofill, entries, export, import, link-preview, users/create)
│   │   ├── auth/callback/      # OAuth redirect code exchange handler
│   │   ├── login/              # Dual OAuth & Email/Password login page
│   │   └── layout.tsx          # Root layout & SEO metadata
│   ├── components/             # Reusable UI components (ShellLayout, EntryCard, CommandPalette, Toast, etc.)
│   ├── lib/                    # Supabase client/server factories, types, utils
│   ├── middleware.ts           # Next.js Edge Auth guard & session persistence
│   └── proxy.ts                # Route matcher logic
```

---

## Quick Setup & Running Locally

```bash
git clone https://github.com/AshishCherian15/Ash-Tech.git
cd Ash-Tech/app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## AI Agent Hand-Off Guide

For detailed architecture, implementation progress, completed features, and next steps for any AI coding agent, read **[PROGRESS.md](./PROGRESS.md)**.
