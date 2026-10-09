# ByteShelf

<div align="center">
  <img src="./public/byteshelf-icon.svg" alt="ByteShelf logo" width="96" />
  
  **Your private, searchable tech memory.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Deploy%20target-Vercel-black?logo=vercel)](https://vercel.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
</div>

---

## What is ByteShelf?

ByteShelf is a private, login-protected personal knowledge base for **tips, tricks, apps, websites, tools, commands, extensions, guides and prompts** — the things you find once, forget you saved, and end up Googling again.

**One search box. One place. Built for a single owner.**

---

## Complete Features

### 🔐 Auth & Security
- **Google/GitHub OAuth & Email/Password Sign-In**: Login with an account provisioned by the owner; public sign-up is not part of the app. Email/password accounts can request a recovery email and set a new password.
- **Guest / Temporary User Access Management**: The owner provisions permanent or temporary email/password accounts from the Users page. Temporary access expires automatically (up to 30 days).
- **Database Row Level Security (RLS)**: Policies are defined for all five application tables and the private image bucket. Apply and verify them in the target Supabase project before launch.
- **Privacy Basics**: No analytics integration, generated `robots.txt` (`Disallow: /`), an intentionally empty sitemap, and `noindex, nofollow` metadata. The private library is not intended for search indexing.

### 🤖 AI Engine & Model Settings
- **AI Provider Support**: OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, Mistral, Together AI, Fireworks AI, xAI, Cerebras, and public OpenAI-compatible HTTPS endpoints.
- **Provider and Model Settings**: Choose a provider, enter the model ID enabled for your key, or use key-prefix auto-detection for common providers. Generic key formats must be selected manually.
- **Key Handling**: The provider key is held in tab memory only, sent through the authenticated autofill endpoint, and cleared on reload or sign-out. Provider preferences (not keys) may be saved in browser storage. Custom endpoints are DNS-checked, pinned to a validated public address, and cannot redirect.
- **Strict Human-in-the-Loop Review**: AI drafts entry fields but **never auto-saves** without owner review.

### 🎨 Visual & Desktop UX
- **Collapsible Side Navigation Panel**: Floating expand/collapse button (`<PanelLeftClose>` / `<PanelLeftOpen>`) for full-screen entry browsing.
- **ByteShelf Brand Mark**: A consistent vector mark in the sidebar, mobile navigation, and login screen.
- **Xiaomi Notes-Style Card Previews**: Masonry & grid cards showcase top header image previews for entries with attached screenshots or site links.
- **Global Command Palette (`Ctrl + K`)**: Keyboard-driven navigation and quick search across up to 500 recently edited entries.
- **Toast Notifications System**: Slide-up feedback toasts for success, error, info, warning, and AI events.

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| **Styling** | Custom Vanilla CSS Tokens (`globals.css`) · Glassmorphism · Smooth Animations |
| **Backend** | Next.js Serverless API Routes · Proxy (`src/proxy.ts`) |
| **Database** | Supabase Postgres (with RLS on every table) |
| **Auth** | Supabase Auth — Google/GitHub OAuth + Email/Password (TOTP flow not integrated) |
| **AI LLM** | User-configured providers; keys are not server environment variables |
| **Deployment target** | Vercel Serverless (deployment not verified) |

---

## Project Structure

```
Ash-Tech/
├── database/
│   ├── schema.sql              # Full Supabase schema + RLS policies
│   └── seed_sample_entries.sql # Seed script for CodeFronts & Windows Clipboard
├── public/
│   ├── byteshelf-icon.svg   # ByteShelf vector app icon
│   ├── icon-192.png            # PWA 192px app icon
│   ├── icon-512.png            # PWA 512px app icon
│   ├── logo.webp               # Brand image
│   └── manifest.json           # Installable PWA manifest
├── src/
│   ├── app/
│   │   ├── (app)/              # Auth-protected app shell (Dashboard, Entries, Categories, Trash, Settings)
│   │   ├── api/                # API routes (account deletion, autofill, entries, export/import, link preview, account provisioning)
│   │   ├── auth/callback/      # OAuth redirect code exchange handler
│   │   ├── auth/reset-password/ # Password recovery page (requires Supabase email setup)
│   │   ├── privacy/, terms/, cookies/ # Legal information pages (drafts; review before use)
│   │   ├── robots.ts            # Generated crawler policy (blocks all crawlers)
│   │   ├── sitemap.ts           # Empty sitemap; no private routes are listed
│   │   ├── login/              # Dual OAuth & Email/Password login page
│   │   ├── not-found.tsx       # Custom 404 page
│   │   └── layout.tsx          # Root layout & no-index metadata
│   ├── components/             # Reusable UI components (ShellLayout, EntryCard, CommandPalette, Toast, etc.)
│   ├── lib/                    # Supabase client/server factories, types, utils
│   └── proxy.ts                # Next.js auth guard & session persistence
├── .env.example                # Environment variable template (no secrets)
├── LICENSE                     # MIT License
└── SECURITY.md                 # Security policy and incident guidance
```

Password recovery requires the Supabase Auth email provider/SMTP and the exact
`/auth/callback` redirect URL (ending at `/auth/reset-password`) to be enabled in the
Supabase project. Test the full recovery email flow before deployment.

### OAuth provider setup

ByteShelf sends OAuth users back to its own `/auth/callback` route. Configure these
separate redirect settings for each environment:

1. In Supabase Auth URL Configuration, set the production Site URL to the deployed
   app origin and allow the exact app callback URLs, such as
   `http://localhost:3000/auth/callback` for local development and
   `https://your-app.example/auth/callback` for production. Add only origins and
   callbacks you control; remove localhost from the production project when it is
   no longer needed.
2. In the Google or GitHub provider console, set its authorized redirect URI to the
   Supabase Auth callback URL shown on that provider's Supabase configuration page.
   This is distinct from ByteShelf's `/auth/callback` URL. For Google, also add the
   local and production app origins under Authorized JavaScript origins.
3. Confirm the Google OAuth consent-screen audience and allowed/test users permit
   the intended private invitees. Do not enable public signup in Supabase Auth.
4. Verify sign-in in a normal, JavaScript-enabled browser using an owner and a
   provisioned test account. A provider/browser error before the redirect returns
   to ByteShelf does not exercise the app callback or prove the callback is broken.

### Database setup (required)

The database schema defines five application tables: `categories`, `entries`,
`entry_links`, `entry_versions`, and `usage_events`. Before running the app against a
Supabase project, verify that it is the intended project, review `database/schema.sql`,
then run that SQL in the Supabase SQL Editor or with an authenticated Supabase CLI
session (`npx supabase login`). From the repository root, the CLI command is
`npx supabase db query --linked --project-ref <PROJECT_REF> --file database/schema.sql`.
The script creates the tables, owner-only RLS policies, update triggers, and the private
`entry-images` bucket.
The entries policy also checks that a selected category belongs to the same authenticated
user; entry create/update requests go through server API handlers that validate their fields,
enforce a request-size limit, and perform the same ownership check.
Do not run it against a production project until you have verified the project target
and reviewed the SQL.

Before using the app, mark the already-existing owner Auth user as provisioned in
trusted `app_metadata` (replace the placeholder with the exact owner sign-in email).
Run this only against the verified target project, in its Supabase SQL Editor or using
an authenticated Supabase CLI session:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
  '{"role":"owner","account_type":"permanent","enabled":true,"expires_at":null}'::jsonb
WHERE lower(email) = lower('OWNER_EMAIL_HERE')
RETURNING id, email;
```

Expect exactly one row. If no row is returned, stop and verify the owner account
before proceeding. This is required because database RLS rejects authenticated
accounts without an explicit trusted owner/permanent/temporary role; the application
proxy's `BYTESHELF_ADMIN_EMAIL` setting does not bypass database RLS. Do not copy these
claims into user-editable metadata.

After applying it, verify all five tables exist and RLS is enabled:

```sql
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('categories', 'entries', 'entry_links', 'entry_versions', 'usage_events')
ORDER BY c.relname;
```

Expect five rows with `rls_enabled = true`. Verify the private image bucket exists:

```sql
SELECT id, public
FROM storage.buckets
WHERE id = 'entry-images';
```

Expect one row with `public = false`. If PostgREST still reports a missing table
after the schema is present, refresh its schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

Then verify reads and owner isolation with disposable staging accounts before using
the project for real data. The owner can create invited accounts, enable/disable them,
and renew expired temporary accounts for a bounded preset duration from Settings.
Temporary accounts always have an expiry (at most 30 days). These operations require
`SUPABASE_SERVICE_ROLE_KEY` and `BYTESHELF_ADMIN_EMAIL`; never expose the service role key
to the browser.

---

## Quick Setup & Running Locally

Clone the repository and run commands from its root directory:

```bash
git clone https://github.com/AshishCherian15/Ash-Tech.git
cd Ash-Tech
cp .env.example .env.local
npm ci
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.
Fill in `.env.local` with the required Supabase project URL and anon key, the
server-only service role key and owner email for account-management features, and
your local app URL. AI provider keys are entered by each user in Settings and are
not configured as server environment variables. Never commit `.env.local` or
expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

Before starting the app, apply and verify [`database/schema.sql`](./database/schema.sql)
in the intended Supabase project and provision the owner account's trusted
`app_metadata`; see the database setup above. Do not apply schema changes to production
without reviewing the SQL and confirming the target project. The sample seed file
contains example records and is optional.

Open [http://localhost:3000](http://localhost:3000) in your browser. Run
`npm run lint` and `npm run build` to check the source and production build; use
`npm start` to serve a completed build locally.

---

## AI Agent Hand-Off Guide

For detailed architecture, implementation progress, completed features, and next steps for any AI coding agent, read **[PROGRESS.md](./PROGRESS.md)**.
