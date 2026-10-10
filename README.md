# ByteShelf

<div align="center">
  <img src="./public/byteshelf-icon.svg" alt="ByteShelf logo" width="96" />
  
  **A reviewed public library of useful tech tools, tips, commands, guides, and prompts.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Deploy%20target-Vercel-black?logo=vercel)](https://vercel.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
</div>

---

## What is ByteShelf?

ByteShelf is a public, searchable, contributor-friendly library for practical technology knowledge: websites, apps, tools, commands, extensions, guides, prompts, tips, tricks, and workflows.

Visitors can browse published entries. Contributors can sign in, draft entries, and submit them for review. Moderators and admins can review pending submissions while private account settings, trash, user management, and admin tools remain protected.

---

## Complete Features

### 🌐 Public Library
- **Published Entry Pages**: Public entries are available at `/entry/[id]`.
- **Published Category Pages**: Public category browsing is available at `/category/[slug]`.
- **Shared Library Dashboard**: Signed-in users default to a shared library view with published entries plus their own in-progress drafts/submissions.
- **SEO & Compliance Pages**: About, Contact, FAQ, Blog/Updates, Pricing, Press, Careers, Community, Newsletter, Status, Changelog, Accessibility, Consent, Legal Notices, Data Retention, License Compliance, Bug Bounty, Refund Policy, Promotions, Sitemap, Privacy, Terms, and Cookies pages are present.

### 🔐 Auth, Moderation & Security
- **OAuth & Email/Password Sign-In**: Supabase Auth powers contributor access.
- **Contributor Review Flow**: Entries can move through `DRAFT`, `PENDING`, `PUBLISHED`, `REJECTED`, and `FLAGGED`.
- **Protected Admin Area**: `/admin`, `/review-queue`, `/users`, settings, trash, and private app routes are server-side protected.
- **Database Row Level Security (RLS)**: Public reads are limited to published content; authors manage their own entries; moderators/admins can access review data.
- **Security Headers & CSRF Guard**: `next.config.ts` configures CSP/security headers and `src/proxy.ts` rejects cross-site mutating API requests.

### 🤖 AI Engine & Model Settings
- **AI Provider Support**: OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, Mistral, Together AI, Fireworks AI, xAI, Cerebras, and public OpenAI-compatible HTTPS endpoints.
- **Provider and Model Settings**: Choose a provider, enter the model ID enabled for your key, or use key-prefix auto-detection for common providers. Generic key formats must be selected manually.
- **Key Handling**: The provider key is held in tab memory only, sent through the authenticated autofill endpoint, and cleared on reload or sign-out. Provider preferences (not keys) may be saved in browser storage. Custom endpoints are DNS-checked, pinned to a validated public address, and cannot redirect.
- **Strict Human-in-the-Loop Review**: AI drafts entry fields but **never auto-saves** without owner review.

### 🎨 Visual & UX
- **Collapsible Side Navigation Panel**: Floating expand/collapse button (`<PanelLeftClose>` / `<PanelLeftOpen>`) for full-screen entry browsing.
- **ByteShelf Brand Mark**: A consistent vector mark in the sidebar, mobile navigation, and login screen.
- **Xiaomi Notes-Style Card Previews**: Masonry & grid cards showcase top header image previews for entries with attached screenshots or site links.
- **Global Command Palette (`Ctrl + K`)**: Keyboard-driven navigation and quick search across up to 500 recently edited entries.
- **Toast Notifications System**: Slide-up feedback toasts for success, error, info, warning, and AI events.
- **Cookie Notice**: Essential cookie/browser-storage notice is shown to visitors.
- **Custom Error Pages**: Friendly not-found and error states are implemented.

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
Tech-Utility/
├── database/
│   ├── schema.sql                  # Base Supabase schema + private-library RLS
│   ├── 01-byteshelf-pivot.sql      # Public-library/users/moderation migration
│   ├── 02-byteshelf-rls-update.sql # Public-library RLS updates
│   └── seed_sample_entries.sql     # Optional sample entries
├── public/
│   ├── byteshelf-icon.svg   # ByteShelf vector app icon
│   ├── icon-192.png            # PWA 192px app icon
│   ├── icon-512.png            # PWA 512px app icon
│   ├── logo.webp               # Brand image
│   └── manifest.json           # Installable PWA manifest
├── src/
│   ├── app/
│   │   ├── (app)/              # Auth-protected app shell (Dashboard, Entries, Categories, Trash, Settings)
│   │   ├── admin/              # Protected admin overview
│   │   ├── api/                # API routes (account deletion, autofill, entries, export/import, link preview, account provisioning)
│   │   ├── auth/callback/      # OAuth redirect code exchange handler
│   │   ├── auth/reset-password/ # Password recovery page (requires Supabase email setup)
│   │   ├── entry/[id]/          # Public published entry detail
│   │   ├── category/[slug]/     # Public category browse
│   │   ├── privacy/, terms/, cookies/ # Legal information pages
│   │   ├── robots.ts            # Generated crawler policy
│   │   ├── sitemap.ts           # XML sitemap for public URLs
│   │   ├── login/              # Dual OAuth & Email/Password login page
│   │   ├── not-found.tsx       # Custom 404 page
│   │   └── layout.tsx          # Root layout & no-index metadata
│   ├── components/             # Reusable UI components (ShellLayout, EntryCard, PublicPage, Toast, etc.)
│   ├── lib/                    # Supabase factories, content registry, types, utils
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
   the intended contributor audience. Public signup can be enabled only if moderation,
   abuse handling, and rate limits are appropriate for the deployment.
4. Verify sign-in in a normal, JavaScript-enabled browser using an owner and a
   provisioned test account. A provider/browser error before the redirect returns
   to ByteShelf does not exercise the app callback or prove the callback is broken.

### Database setup (required)

The database schema starts with five application tables: `categories`, `entries`,
`entry_links`, `entry_versions`, and `usage_events`. The public-library migration adds
`public.users`, moderation fields, `reports`, `moderation_actions`, and public-library
RLS policies. Before running the app against a Supabase project, verify that it is the
intended project and review all SQL files.

Apply the SQL files in order:

1. `database/schema.sql`
2. `database/01-byteshelf-pivot.sql`
3. `database/02-byteshelf-rls-update.sql`

The scripts create the tables, RLS policies, update triggers, moderation objects,
published-entry indexes, and the private `entry-images` bucket.
Do not run it against a production project until you have verified the project target
and reviewed the SQL.

**Additional Migrations (Optional but Recommended):**

4. `database/03-add-pricing-columns.sql` - Adds pricing/pricing_note fields
5. `database/04-seed-data.sql` - Adds sample categories and entries (requires admin UUID replacement)
6. `database/05-add-published-index.sql` - Performance index for published entries
7. `database/06-add-reports-constraint.sql` - Prevents duplicate reports
8. `database/07-link-health-checks.sql` - Table for future link health cron job

See [`database/MIGRATION_STATUS.md`](./database/MIGRATION_STATUS.md) for detailed migration tracking and verification steps.

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
before proceeding. The public-library migration also backfills `public.users`; confirm
the owner row has the `ADMIN` role after applying the pivot migration.

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

Then verify public published reads, author isolation, and moderator access with
disposable staging accounts before using the project for real data. The owner can
create invited accounts, enable/disable them, and renew expired temporary accounts.
Temporary accounts always have an expiry (at most 30 days). These operations require
`SUPABASE_SERVICE_ROLE_KEY` and `BYTESHELF_ADMIN_EMAIL`; never expose the service role key
to the browser.

---

## Quick Setup & Running Locally

Clone the repository and run commands from its root directory:

```bash
git clone https://github.com/AshishCherian15/Tech-Utility.git
cd Tech-Utility
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

Before starting the app, apply and verify the database SQL files in the order listed
above and provision the owner account's trusted metadata; see the database setup
above. Do not apply schema changes to production without reviewing the SQL and
confirming the target project. The sample seed file contains example records and is
optional.

Open [http://localhost:3000](http://localhost:3000) in your browser. Run
`npm run lint` and `npm run build` to check the source and production build; use
`npm start` to serve a completed build locally.

---

## Latest Verification

The current project has been checked with:

```bash
npm run lint
npm run build
```

Both commands pass after the public-library, compliance-page, and documentation update.

---

## Security Note

If any real Supabase service role key or AI provider key was ever committed to Git
history, rotate it immediately. Removing a key from the working tree is not enough:
treat historical secrets as compromised and plan a coordinated history rewrite if this
repository is shared publicly.

---

## AI Agent Hand-Off Guide

For detailed architecture, implementation progress, completed features, and next steps for any AI coding agent, read **[PROGRESS.md](./PROGRESS.md)**.
