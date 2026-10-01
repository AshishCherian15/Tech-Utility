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

### Why it exists

Useful discoveries are scattered across:
- 📱 Phone screenshots
- ☁️ Google Drive files  
- 💬 WhatsApp saved messages
- 📝 Scattered notes

When you need something again, you either can't find it or re-search the web for something you already found once. Ash-Tech gives every discovery **one consistent shape** and makes it findable by what you remember, not where you put it.

---

## Features

### ✅ Phase 1 & 2 (Complete)
- 🔐 **Secure login** — Google / GitHub OAuth + optional TOTP 2FA, no public sign-up
- 📝 **Structured entries** — Title, category, type, tags, usefulness fields, command snippet, images, links
- 🔍 **Instant search** — Full-text across title, tags, command text, and category
- 📂 **Custom categories** — Name, emoji icon, color, description
- 🗑️ **30-day trash bin** — Soft delete with restore, auto-purge
- 📤 **JSON export / import** — Full library backup, no lock-in
- 🤖 **AI autofill** — Paste a URL/title/description → Gemini drafts the entry fields for your review (never auto-saves)
- 🌗 **Dark mode default** — Clean, premium dark UI

### 🔜 Coming Next (Phase 3–4)
- Grid / List / Table / Gallery view switcher *(UI done, polish in progress)*
- Ctrl+K command palette
- Favorites & recently viewed
- Link preview (title/favicon/image)
- Per-platform app link resolver

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React · TypeScript |
| **Styling** | Vanilla CSS (custom design system) · no Tailwind utilities used |
| **Backend** | Next.js Route Handlers (Vercel serverless) |
| **Database** | Supabase Postgres (with RLS on every table) |
| **Auth** | Supabase Auth — Google/GitHub OAuth + TOTP 2FA |
| **Storage** | Supabase Storage — private bucket, signed URLs |
| **AI** | Gemini 1.5 Flash (free tier) — server-side only, extraction-only prompting |
| **Hosting** | Vercel Hobby plan |
| **Cost** | **$0/month** — all free tiers |

---

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── (app)/              # Auth-protected app routes
│   │   │   ├── dashboard/      # Main home page
│   │   │   ├── entries/        # Entry CRUD + detail view
│   │   │   ├── categories/     # Category management
│   │   │   ├── trash/          # 30-day soft-delete bin
│   │   │   └── settings/       # Profile, export, security
│   │   ├── api/                # Serverless API routes
│   │   │   ├── autofill/       # AI entry drafting (Gemini)
│   │   │   ├── entries/        # CRUD + search
│   │   │   └── export/         # JSON backup download
│   │   ├── auth/callback/      # OAuth redirect handler
│   │   └── login/              # Login page
│   ├── components/             # Reusable UI components
│   ├── lib/
│   │   ├── supabase/           # Typed Supabase client factories
│   │   ├── types.ts            # All TypeScript types
│   │   └── utils.ts            # Utility helpers
│   └── proxy.ts                # Auth guard (Next.js 16)
├── database/
│   └── schema.sql              # Full Supabase schema + RLS
├── public/
│   └── manifest.json           # PWA manifest
├── .env.example                # Environment variable template
├── LICENSE                     # MIT
└── SECURITY.md                 # Security policy
```

---

## Local Development

### Prerequisites
- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free)
- A [Gemini API key](https://aistudio.google.com/app/apikey) (optional, for AI autofill)

### 1. Clone & install

```bash
git clone https://github.com/AshishCherian15/Ash-Tech.git
cd Ash-Tech/app
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project
2. Run [`database/schema.sql`](./database/schema.sql) in the SQL Editor
3. Create a private Storage bucket named `entry-images`
4. Enable Google and/or GitHub OAuth providers in Authentication → Providers
5. Disable "Enable email signups" in Authentication → Settings

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase URL, anon key, and optional Gemini API key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## Deployment

### Vercel (recommended)

```bash
npx vercel --prod
```

Add all `.env.local` values as Vercel Environment Variables. Mark `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` as **Secret** (not exposed to the browser).

Also add your Vercel URL to Supabase:
- Authentication → URL Configuration → Redirect URLs: `https://YOUR_APP.vercel.app/auth/callback`

---

## Build Phases

| Phase | Status | Goal |
|---|---|---|
| **Phase 1** | ✅ Done | Auth skeleton, Supabase setup, secure deployment |
| **Phase 2** | ✅ Done | Core CRUD, search, categories, trash, export |
| **Phase 3** | 🔜 Next | View switcher polish, Ctrl+K palette, dark/light toggle |
| **Phase 4** | 📅 Planned | AI autofill, link preview, app link resolver |
| **Phase 5** | 📅 Planned | Tip of the day, version history, usage tracking |
| **Phase 6** | 📅 Planned | PWA install, per-entry export, link health checker |
| **Phase 7** | 📅 Planned | Browser extension |

---

## Security

See [SECURITY.md](./SECURITY.md) for the full security model including RLS policies, AI guardrails, and secret management.

**Key points:**
- Every API route validates the session server-side — no client-supplied user IDs trusted
- RLS on every table — owner-only read/write enforced at the database level
- AI output is never auto-saved — always requires owner review
- The AI API key never reaches the browser

---

## License

[MIT](./LICENSE) — © 2026 Ashish Cherian

*Private personal project. Not published as a public product in V1.*
