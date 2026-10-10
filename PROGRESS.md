# ByteShelf — Project Progress & AI Agent Handoff Document

> **Last Updated:** October 10, 2026
> **Repository:** [https://github.com/AshishCherian15/Tech-Utility](https://github.com/AshishCherian15/Tech-Utility)
> **Status:** ByteShelf is a **public, reviewed technology library** with completed public-library features, compliance pages, and enhanced dashboard UX. The schema is installed with public-library migrations (status, moderation, reports). All core flows (public browsing, contributor submission, moderation, account management) are implemented. The application is ready for production deployment with documented security gaps (rate limiting, MFA) that should be addressed before broad public launch.

---

## 📌 Executive Project Summary

**ByteShelf** is a public, searchable, contributor-friendly library for practical technology knowledge: websites, apps, tools, commands, extensions, guides, prompts, tips, tricks, and workflows. Visitors can browse published entries. Contributors can sign in, draft entries, and submit them for review. Moderators and admins can review pending submissions while private account settings, trash, user management, and admin tools remain protected.

---

## 🏗️ Implementation Roadmap

### ✅ Phase 1: Security & Database Foundation (Public-library schema and RLS implemented)
- **Supabase DDL Schema**: PostgreSQL tables (`entries`, `categories`, `entry_links`, `entry_versions`, `usage_events`, `reports`, `moderation_actions`, `public.users`) and their ownership constraints are defined in [`database/schema.sql`](./database/schema.sql) and public-library migrations.
- **Row Level Security (RLS)**: Public-library RLS policies implemented via `01-byteshelf-pivot.sql` and `02-byteshelf-rls-update.sql`. Public reads limited to `PUBLISHED` entries. Authors manage their own drafts/pending entries. Moderators/admins have review access.
- **Auth Guard**: Next.js Proxy ([`src/proxy.ts`](./src/proxy.ts)) managing session cookies and route protection with backward compatibility for missing schema columns.

### ✅ Phase 2: Core Library & Data Loop (CRUD operations complete with public-library support)
- **CRUD Operations**: Complete creation, editing, detail view, and deletion of entries with status flow (DRAFT → PENDING → PUBLISHED/REJECTED/FLAGGED).
- **Categories & Tags**: Custom categories with icons/colors and autocomplete tagging. Categories have descriptions surfaced on browse pages.
- **Trash Bin**: Soft-delete and restore (`deleted_at`); no automatic purge job is configured, so deleted entries remain until restored or permanently deleted with the account.
- **JSON Export & Import**: Export/import of records, categories, links, and timestamps. Uploaded image files remain in private Storage and are not bundled in backups.
- **Pricing Support**: Entry pricing tiers (free/freemium/paid) with badges and filtering support.
- **Reports System**: POST `/api/reports` for flagging entries with duplicate prevention constraint.

### ✅ Phase 3: UI/UX & Navigation (Complete with public-library enhancements)
- **Collapsible Sidebar**: Expandable/collapsible navigation panel with floating `<PanelLeftClose>` toggle button in [`src/components/ShellLayout.tsx`](./src/components/ShellLayout.tsx).
- **Xiaomi Notes-Style Card Previews**: Highlighting image header previews for visual entries in [`src/components/EntryCard.tsx`](./src/components/EntryCard.tsx).
- **Command Palette**: `Ctrl + K` global keyboard shortcut modal in [`src/components/CommandPalette.tsx`](./src/components/CommandPalette.tsx).
- **Toast Notifications**: Multi-variant notification system (success, error, info, warning, AI).
- **Premium Visual Design System**: Modern brand palette with 4-stop gradients (blue → deep blue → purple → cyan), enhanced buttons with inner glow and shine effects, refined cards with gradient backgrounds, improved inputs with inset glow, updated navigation with gradient hover states, and comprehensive dark mode support. See [`src/app/globals.css`](./src/app/globals.css) and [`src/components/BrandMark.tsx`](./src/components/BrandMark.tsx).
- **Redesigned Brand Mark**: Tech-focused logo with stylized "T", bracket elements, circuit patterns, and accent dots. Available as SVG and generated PNG icons (192px, 512px) for PWA integration.
- **Masonry View Mode**: Fifth view mode using CSS columns for responsive card layout.
- **Skeleton Loading States**: Loading skeletons matching card shapes for all view modes.
- **Keyboard Shortcuts**: N (new entry), E (edit), F (favorite), P (pin) on focused cards.
- **Pending Review Badge**: Visual indicator for contributor-owned PENDING entries.
- **Inline Quick Actions**: Favorite/pin/copy controls directly on entry cards.

### ✅ Phase 4: AI Autofill & Model Engine (Complete with multi-provider support)
- **Multi-Provider AI Engine**: Server route [`/api/autofill/route.ts`](./src/app/api/autofill/route.ts) supporting OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, Mistral, Together AI, Fireworks AI, xAI, Cerebras, and custom OpenAI-compatible endpoints.
- **AI Provider Settings**: Provider toggles and custom API key overrides in [`src/components/SettingsClient.tsx`](./src/components/SettingsClient.tsx); user keys are stored in browser local storage.
- **Strict Guardrails**: Extraction-only system prompt (no invented URLs, no auto-saving without owner review). DNS-pinned custom endpoints with public IP validation.
- **Note**: AI autofill currently works with user-provided text. Real URL content fetching (Mozilla Readability) is documented in BS0 but not yet implemented.

### ✅ Phase 5: Account Access & Compliance (Complete with public compliance pages)
- **Permanent & Guest User Management**: Endpoint [`/api/users/create/route.ts`](./src/app/api/users/create/route.ts) for provisioning Permanent or Guest users with username, password, and account status toggles.
- **Temporary Account Expiration**: Temporary accounts require a bounded expiry (up to 30 days); the owner can renew expired temporary access for preset durations. Permanent accounts do not expire.
- **Password Reveal Toggle**: Password visibility toggle (`Eye` / `EyeOff`) added to user creation UI in [`SettingsClient.tsx`](./src/components/SettingsClient.tsx).
- **Link Preview & OpenGraph Extraction**: Endpoint [`/api/link-preview/route.ts`](./src/app/api/link-preview/route.ts) with `🌐 Link Preview` trigger button in [`EntryForm.tsx`](./src/components/EntryForm.tsx).
- **Public Compliance Pages**: About, Contact, FAQ, Blog, Pricing, Press, Careers, Community, Newsletter, Status, Changelog, Accessibility, Consent, Legal Notices, Data Retention, License, Bug Bounty, Refund Policy, Promotions, Privacy, Terms, and Cookies pages.
- **SEO & Sitemap**: Dynamic sitemap generation including public routes. Robots.txt for crawler policy.
- **Cookie Consent**: Essential cookie/browser-storage notice for visitors.

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

## 🚧 Remaining Work Before Public Launch

### High Priority (Security & Reliability)
1. **Distributed Rate Limiting**: Implement shared-store rate limiting for auth/signup, AI autofill, and entry submission endpoints (documented in SECURITY.md as a known gap).
2. **Monitoring & Error Dashboards**: Connect monitoring/error tracking before broad public launch.
3. **Automated Backups**: Configure automated weekly backups via Vercel cron + Supabase Storage (SQL file exists, route not implemented).
4. **MFA Enforcement**: Configure and enforce TOTP challenge at sign-in (Supabase Auth supports it, app doesn't enforce it yet).

### Medium Priority (Feature Enhancements)
1. **Real URL Content Fetching**: Implement Mozilla Readability for AI autofill to fetch actual page content (documented in BS0/10-REAL-FETCH-AUTOFILL.md).
2. **DPDP Consent Flow**: Add consent checkboxes to signup for terms/privacy/age confirmation (documented in BS0/11-DPDP-CONSENT-AND-AUTH-FORMS.md).
3. **Mobile Sidebar Drawer**: Implement edge-swipe sidebar drawer for mobile UX (documented in BS/01-FRONTEND-UPGRADE.md).
4. **Dynamic Entry Types**: Convert entry types from hardcoded enum to database table (documented in BS0/09-DYNAMIC-TYPES-AND-CATEGORIES.md).

### Database Migrations to Verify
The following SQL files may need manual execution in Supabase SQL Editor:
- `database/03-add-pricing-columns.sql` - pricing/pricing_note columns
- `database/04-seed-data.sql` - sample categories and entries (requires admin UUID replacement)
- `database/05-add-published-index.sql` - performance index for published entries
- `database/06-add-reports-constraint.sql` - duplicate report prevention
- `database/07-link-health-checks.sql` - link health table for future cron job

See `DATABASE_MIGRATION_GUIDE.md` for step-by-step instructions.

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
