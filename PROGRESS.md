# Ash-Tech — Project Progress & AI Agent Handoff Document

> **Last Updated:** October 4, 2026
> **Repository:** [https://github.com/AshishCherian15/Ash-Tech](https://github.com/AshishCherian15/Ash-Tech)  
> **Status:** The main application flows are implemented, but the app is **not yet verified or ready for invited-user launch**. The schema is installed on the confirmed staging project; all five tables, RLS flags/policies, the private image bucket, and trusted owner metadata were verified. Local `ASH_OWNER_EMAIL` is configured. Owner Google sign-in and basic entry create/read/soft-delete were smoke-tested; cross-account isolation and the broader authenticated workflows remain untested.

---

## 📌 Executive Project Summary

**Ash-Tech** is a private, login-gated personal knowledge memory app built for **Ashish Cherian**. It stores technical discoveries (tips, tricks, hacks, apps, tools, commands, extensions, prompts) with instant search, AI-assisted drafting, custom categories, soft delete, and guest account management.

---

## 🏗️ Implementation Roadmap

### ⚠️ Phase 1: Security & Database Foundation (Schema and owner metadata installed; app authorization verification pending)
- **Supabase DDL Schema**: PostgreSQL tables (`entries`, `categories`, `entry_links`, `entry_versions`, `usage_events`) and their ownership constraints are defined in [`database/schema.sql`](./database/schema.sql).
- **Row Level Security (RLS)**: Policies require trusted, enabled owner/permanent/temporary account metadata; child rows additionally require a parent entry owned by the same user. The user applied the schema to confirmed staging; all five tables respond over PostgREST, each has RLS enabled and one policy, and the private `entry-images` bucket exists. Actual policy enforcement and cross-account isolation still require authenticated tests.
- **Auth Guard**: Next.js Proxy ([`src/proxy.ts`](./src/proxy.ts)) managing session cookies and route protection.

### ⚠️ Phase 2: Core Library & Data Loop (Owner create/read/soft-delete smoke test passed; broader live verification pending)
- **CRUD Operations**: Complete creation, editing, detail view, and deletion of entries.
- **Categories & Tags**: Custom categories with icons/colors and autocomplete tagging.
- **Trash Bin**: Soft-delete and restore (`deleted_at`); no automatic purge job is configured, so deleted entries remain until restored or permanently deleted with the account.
- **JSON Export & Import**: Export/import of records, categories, links, and timestamps. Uploaded image files remain in private Storage and are not bundled in backups.

### ⚠️ Phase 3: UI/UX & Navigation (Source implementation complete; authenticated user testing pending)
- **Collapsible Sidebar**: Expandable/collapsible navigation panel with floating `<PanelLeftClose>` toggle button in [`src/components/ShellLayout.tsx`](./src/components/ShellLayout.tsx).
- **Xiaomi Notes-Style Card Previews**: Highlighting image header previews for visual entries in [`src/components/EntryCard.tsx`](./src/components/EntryCard.tsx).
- **Command Palette**: `Ctrl + K` global keyboard shortcut modal in [`src/components/CommandPalette.tsx`](./src/components/CommandPalette.tsx).
- **Toast Notifications**: Multi-variant notification system (success, error, info, warning, AI).
- **Branding**: Official 48x48px logo integration across login and sidebar headers.

### ⚠️ Phase 4: AI Autofill & Model Engine (Source implementation complete; provider and quota verification pending)
- **Dual AI Engine**: Server route [`/api/autofill/route.ts`](./src/app/api/autofill/route.ts) supporting **Groq (Llama 3.3 70B)** and **Google Gemini 2.5 Flash**.
- **AI Provider Settings**: Provider toggles and custom API key overrides in [`src/components/SettingsClient.tsx`](./src/components/SettingsClient.tsx); user keys are stored in browser local storage.
- **Strict Guardrails**: Extraction-only system prompt (no invented URLs, no auto-saving without owner review).

### ⚠️ Phase 5: Account Access & Compliance (Source implementation complete; staging verification pending)
- **Permanent & Guest User Management**: Endpoint [`/api/users/create/route.ts`](./src/app/api/users/create/route.ts) for provisioning Permanent or Guest users with username, password, and account status toggles.
- **Temporary Account Expiration**: Temporary accounts require a bounded expiry (up to 30 days); the owner can renew expired temporary access for preset durations. Permanent accounts do not expire.
- **Password Reveal Toggle**: Password visibility toggle (`Eye` / `EyeOff`) added to user creation UI in [`SettingsClient.tsx`](./src/components/SettingsClient.tsx).
- **Link Preview & OpenGraph Extraction**: Endpoint [`/api/link-preview/route.ts`](./src/app/api/link-preview/route.ts) with `🌐 Link Preview` trigger button in [`EntryForm.tsx`](./src/components/EntryForm.tsx).
- **Privacy basics**: `robots.txt` (`Disallow: /`), `noindex, nofollow` metadata, and no analytics telemetry. Privacy/legal notices are drafts; this is not a claim of legal or DPDP compliance.

---

## 📂 Key File Locations

| Component / Function | File Path |
|---|---|
| **Auth Proxy** | [`src/proxy.ts`](./src/proxy.ts) |
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

## 🚧 Remaining Work Before Inviting Real Users

1. The user confirmed isolated staging and applied `database/schema.sql`; all five tables, RLS flags/policies, the private image bucket, and trusted owner metadata were verified. The dev server was restarted to load `.env.local`; `/login` returned HTTP 200, the unauthenticated home route redirected to `/login`, and an unknown route returned HTTP 404. Owner Google sign-in reached `/dashboard`; creating and reading a disposable entry succeeded, moving it to Trash succeeded, and a targeted staging cleanup left Trash empty. Cross-account isolation and edit/history behavior remain untested.
2. Add required secrets to the hosting environment without exposing them; test account provisioning/disable/renewal, recovery, RLS isolation, image access, import/export, and deletion using disposable staging accounts.
3. Configure owner MFA, provider redirects/session and rate limits, AI usage/spend limits, backups and restore, monitoring/alerts, and a rollback plan.
4. Exercise mobile, keyboard, and authenticated user workflows; perform a bounded load test and run penetration testing only against isolated staging.
5. Review/finalize privacy and terms details for the actual jurisdictions and intended invitees; the current notices are drafts.

See [`REVIEW.md`](./REVIEW.md) for the evidence-based prioritized checklist and verification record.

## 💡 Possible Future Extensions (Not Launch Requirements)

Consider these only after the private app is safely configured and verified:

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
   npm run dev
   ```
2. **Verify production build**:
   ```bash
   npm run build
   ```
3. **Deploy to Vercel / Git**:
   ```bash
   git status --short
   git add -- <reviewed-paths>
   git commit -m "your update message"
   git push origin main
   ```
