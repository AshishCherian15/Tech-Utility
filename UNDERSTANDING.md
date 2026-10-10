# ByteShelf - Complete Project Understanding & AI Handoff Document

> **Created:** October 10, 2026
> **Repository:** https://github.com/AshishCherian15/Tech-Utility
> **Production:** https://byteshelftech.vercel.app
> **Purpose:** Complete project understanding for AI agents to quickly resume work from any drop point

---

## 📌 EXECUTIVE SUMMARY

**ByteShelf** is a **public, reviewed technology library** where visitors can browse published entries, contributors can submit content for review, and moderators can approve/reject submissions. It transforms from a private knowledge vault to a community-built resource.

**Current Status:** Production-ready with Phase 1-5 of the BS/BS0 upgrade plan complete. Core public-library features, UX enhancements, AI improvements, and DPDP compliance are implemented.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Technology Stack

| Layer | Technology | Purpose |
|--------|------------|---------|
| **Frontend** | Next.js 16.3.8 (App Router) | React 19, TypeScript 5 |
| **Styling** | Custom CSS (globals.css) | Glassmorphism, gradients, dark/light mode |
| **Backend** | Next.js Serverless API Routes | REST API with Supabase integration |
| **Database** | Supabase PostgreSQL | Row Level Security (RLS) on all tables |
| **Auth** | Supabase Auth | OAuth (Google/GitHub) + Email/Password |
| **AI** | Multi-provider support | User-provided keys, no server-side AI keys |
| **Deployment** | Vercel | Serverless functions, automatic deployment |

### Key Design Decisions

1. **Public Library Model**: Published entries are visible to everyone. Contributors see their own drafts/pending submissions.
2. **RLS-First Security**: All database access controlled by Supabase RLS policies, not application logic.
3. **AI Human-in-the-Loop**: AI autofill pre-fills forms but never auto-saves without user review.
4. **Client-Side AI Keys**: User AI keys stored in browser local storage, never server-persisted.
5. **Backward Compatibility**: Code works with and without the public-library schema (status column).

---

## 📂 PROJECT STRUCTURE

```
Tech-Utility/app/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── (app)/                    # Auth-protected app routes
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── entries/             # Entry CRUD
│   │   │   ├── categories/          # Category management
│   │   │   ├── settings/            # User settings
│   │   │   ├── users/               # User management (owner only)
│   │   │   ├── review-queue/        # Moderation queue
│   │   │   ├── trash/               # Soft-deleted items
│   │   │   └── favorites/           # Favorited entries
│   │   ├── admin/                    # Admin overview (protected)
│   │   ├── api/                      # API routes
│   │   │   ├── entries/             # GET (library/mine), POST, PATCH, DELETE
│   │   │   ├── entries/[id]/         # Entry CRUD by ID
│   │   │   ├── reports/             # POST for flagging entries
│   │   │   ├── account/             # Account deletion
│   │   │   ├── users/               # User listing (owner)
│   │   │   ├── users/create/        # User provisioning (owner)
│   │   │   ├── autofill/            # AI-powered entry drafting
│   │   │   ├── export/              # JSON export
│   │   │   ├── import/              # JSON import
│   │   │   └── link-preview/        # OpenGraph metadata extraction
│   │   ├── auth/                    # Supabase auth callbacks
│   │   ├── entry/[id]/               # Public entry detail page
│   │   ├── category/[slug]/          # Public category browse page
│   │   ├── login/                   # Split-screen login/signup
│   │   ├── privacy/, terms/, cookies/ # Compliance pages
│   │   ├── (public pages)         # About, Contact, FAQ, etc.
│   │   ├── layout.tsx               # Root layout
│   │   ├── robots.ts                # Crawler policy
│   │   └── sitemap.ts               # SEO sitemap
│   ├── components/                  # Reusable React components
│   │   ├── ShellLayout.tsx          # Main app shell with sidebar
│   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   ├── DashboardClient.tsx     # Dashboard logic & views
│   │   ├── EntryCard.tsx            # Card component with quick actions
│   │   ├── EntryCardSkeleton.tsx    # Loading skeleton
│   │   ├── EntryListItem.tsx        # List view item
│   │   ├── EntryDetail.tsx          # Entry detail view
│   │   ├── EntryForm.tsx            # Entry creation/editing form
│   │   ├── SettingsClient.tsx       # Settings UI
│   │   ├── CommandPalette.tsx       # Ctrl+K global search
│   │   ├── Toast.tsx                # Notification system
│   │   ├── BrandMark.tsx            # Logo component
│   │   ├── GalleryCard.tsx          # Gallery view card
│   │   ├── PublicPage.tsx           # Compliance page template
│   │   └── CookieConsent.tsx        # Cookie notice
│   ├── lib/                         # Utilities and helpers
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   └── admin.ts              # Service-role client (owner only)
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── utils.ts                 # Helper functions
│   │   ├── validation/
│   │   │   └── entry.ts            # Zod schemas
│   │   ├── public-page-content.ts    # Compliance page content registry
│   │   └── use-image-urls.ts        # Image URL utility
│   └── proxy.ts                     # Auth guard & session middleware
├── database/                        # SQL migration files
│   ├── schema.sql                   # Base schema (private library)
│   ├── 01-byteshelf-pivot.sql        # Public library migration
│   ├── 02-byteshelf-rls-update.sql  # RLS policies for public library
│   ├── 03-add-pricing-columns.sql    # Pricing support
│   ├── 04-seed-data.sql             # Sample categories and entries
│   ├── 05-add-published-index.sql    # Performance index
│   ├── 06-add-reports-constraint.sql # Duplicate report prevention
│   ├── 07-link-health-checks.sql    # Link health table (for cron)
│   └── MIGRATION_STATUS.md         # Migration execution tracking
├── public/                         # Static assets
│   ├── byteshelf-icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo.webp
│   └── manifest.json
├── .env.example                    # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔧 KEY FILES TO UNDERSTAND EACH AREA

### Frontend: Dashboard & Views

| File | Purpose | Key Features |
|------|---------|-------------|
| `src/components/DashboardClient.tsx` | Main dashboard logic | View modes (grid/list/table/gallery/masonry), filters, search, pagination, keyboard shortcuts |
| `src/components/EntryCard.tsx` | Entry display card | Quick actions (favorite/pin/copy), responsive design, status badges |
| `src/components/EntryForm.tsx` | Entry creation/editing | Form fields, AI autofill integration, pricing dropdown |
| `src/components/EntryDetail.tsx` | Entry detail view | Full content display, report button, edit actions |
| `src/components/CommandPalette.tsx` | Global search (Ctrl+K) | Keyboard navigation, quick actions |
| `src/components/ShellLayout.tsx` | App shell with sidebar | Collapsible sidebar, responsive layout |
| `src/components/Sidebar.tsx` | Navigation menu | Links to all sections, user info |

### Frontend: Authentication

| File | Purpose | Key Features |
|------|---------|-------------|
| `src/app/login/page.tsx` | Login/signup page | Email/password auth, consent checkboxes, password reset, error handling |
| `src/proxy.ts` | Auth middleware | Session validation, route protection, redirect handling |

### Backend: API Routes

| File | Purpose | Key Features |
|------|---------|-------------|
| `src/app/api/entries/route.ts` | Entry CRUD API | GET (library/mine scope), POST, PATCH, DELETE, pricing filtering, backward compatibility |
| `src/app/api/entries/[id]/route.ts` | Entry by ID API | CRUD operations with ownership checks |
| `src/app/api/reports/route.ts` | Report system | Flag entries, duplicate prevention |
| `src/app/api/autofill/route.ts` | AI autofill | Multi-provider support, URL content fetching, robots.txt checking |
| `src/app/api/export/route.ts` | Data export | JSON export of all user data |
| `src/app/api/import/route.ts` | Data import | JSON import with validation |
| `src/app/api/users/route.ts` | User listing | List all users (owner only) |
| `src/app/api/users/create/route.ts` | User provisioning | Create permanent/guest accounts (owner only) |
| `src/app/api/account/route.ts` | Account operations | Password change, account deletion |

### Database Schema

| File | Purpose | Key Tables |
|------|---------|------------|
| `database/schema.sql` | Base schema | categories, entries, entry_links, entry_versions, usage_events |
| `database/01-byteshelf-pivot.sql` | Public library migration | public.users, moderation fields, reports, moderation_actions |
| `database/02-byteshelf-rls-update.sql` | RLS policies | Public reads, author isolation, moderator access |
| `database/03-add-pricing-columns.sql` | Pricing support | pricing, pricing_note columns |
| `database/04-seed-data.sql` | Sample data | 8 categories, 10 sample entries |
| `database/05-add-published-index.sql` | Performance | Partial index on published_at |
| `database/06-add-reports-constraint.sql` | Reports | Unique constraint on (entry_id, user_id) |
| `database/07-link-health-checks.sql` | Link health | Table for future cron job |

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `categories` | Entry categories | id, name, description, icon, color |
| `entries` | Main content | id, title, type, what_it_is, why_useful, **status**, **pricing**, user_id, category_id, tags, pinned, favorited, published_at |
| `entry_links` | Entry URLs | id, entry_id, url, title |
| `entry_versions` | Entry history | id, entry_id, data, created_at |
| `usage_events` | Usage tracking | id, entry_id, user_id, action |
| `public.users` | User profiles | id, display_name, bio, public_profile |
| `reports` | User reports | id, entry_id, user_id, reason, created_at |
| `moderation_actions` | Moderation history | id, entry_id, moderator_id, action, reason |
| `entry-images` | Private storage | entry_id, file_path (private bucket) |

### Status Enum Flow

```
DRAFT → PENDING → PUBLISHED (published_at set)
          ↓
        REJECTED (rejection_reason set)
          ↓
        FLAGGED (reports threshold exceeded)
```

---

## ✅ IMPLEMENTED FEATURES

### Phase 1: Database Fixes & Pricing Support ✅

**Completed:**
- Added `pricing` and `pricing_note` columns to database
- Removed dead `author_id` from TypeScript types
- Added pricing dropdown to EntryForm
- Added pricing badges to EntryCard and EntryDetail
- Added pricing filter to DashboardClient and API
- Created seed data SQL (8 categories, 10 sample entries)
- File: `database/03-add-pricing-columns.sql`, `database/04-seed-data.sql`

### Phase 2: Backend Enhancements ✅

**Completed:**
- Partial index on `published_at` for performance
- Unique constraint on reports table
- POST `/api/reports` route with validation
- Report button on public entry detail
- Link health table with RLS policies
- Files: `database/05-add-published-index.sql`, `database/06-add-reports-constraint.sql`, `database/07-link-health-checks.sql`, `src/app/api/reports/route.ts`

**Deferred (requires Vercel cron setup):**
- Link health checker cron job
- Automated backup cron job

### Phase 3: Frontend UX Improvements ✅

**Completed:**
- Inline favorite/pin quick actions on EntryCard
- Masonry view mode (5th view mode with CSS columns)
- Skeleton loading states for all view modes
- Keyboard shortcuts (N for new entry, E/F/P on focused cards)
- Pending review badge for contributor-owned PENDING entries
- Files: `src/components/EntryCard.tsx`, `src/components/EntryCardSkeleton.tsx`, `src/components/DashboardClient.tsx`, `src/components/CommandPalette.tsx`

### Phase 4: Real URL Content Fetching ✅

**Completed:**
- Installed @mozilla/readability and jsdom
- Added fetchPageContent function to extract readable page content
- Added robots.txt checking before fetching
- Integrated real content fetch into autofill flow
- Added graceful degradation with clear error message
- 8-second timeout, 6000 char cap, proper User-Agent
- Files: `src/app/api/autofill/route.ts`, `package.json`

### Phase 5: DPDP Consent Flow ✅

**Completed:**
- Terms of Service acceptance checkbox (required) on signup
- Age confirmation checkbox (13+ years, required) on signup
- Marketing consent checkbox (optional) on signup
- Privacy & Data Rights section in settings
- Request Data Export button in settings
- Privacy Grievance contact link in settings
- Updated privacy page with grievance officer contact
- Data retention section (30-day policy)
- Grievance handling section (14/30 day timeline)
- Files: `src/app/login/page.tsx`, `src/components/SettingsClient.tsx`, `src/app/privacy/page.tsx`

### Previously Completed (Before BS/BS0)

**Public Library Foundation:**
- Public `/entry/[id]` and `/category/[slug]` routes
- Dashboard defaulting to shared library view
- `GET /api/entries?scope=library` API
- Backward compatibility for missing status column
- Homepage copy updated to "Community-Built Tech Library"
- Database migration guide created

**Compliance Pages:**
- 22+ public compliance pages (About, Contact, FAQ, Blog, Pricing, Press, Careers, Community, Newsletter, Status, Changelog, Accessibility, Consent, Legal Notices, Data Retention, License, Bug Bounty, Refund Policy, Promotions, Sitemap, Privacy, Terms, Cookies)
- CookieConsent component
- Protected /admin landing page
- Updated documentation (README.md, SECURITY.md, LICENSE)

**Security:**
- Removed hardcoded credentials from owner helper scripts
- Credentials now read from environment variables
- Security documentation updated

---

## ⏳ PENDING IMPLEMENTATION

### Phase 6: Dynamic Entry Types & Categories (Not Started)

**From BS0/09-DYNAMIC-TYPES-AND-CATEGORIES.md**

**What to do:**
- Convert entry types from hardcoded enum to database table
- Create `entry_types` table with fields: id, name, description, icon, color, is_active
- Build creatable combobox component for type/category selection
- Add entry types management page for admins
- Update EntryForm to use dynamic types
- Update type validation schema

**Files to modify:**
- Create: `database/08-add-entry-types-table.sql`
- Modify: `src/lib/types.ts`, `src/lib/validation/entry.ts`, `src/components/EntryForm.tsx`
- Create: `src/app/(app)/entry-types/page.tsx`

### Phase 7: Mobile Sidebar Drawer (Not Started)

**From BS/01-FRONTEND-UPGRADE.md §2**

**What to do:**
- Implement mobile sidebar drawer with edge swipe
- Add semi-transparent backdrop when open
- Touch handling: `touchstart`/`touchmove` X-delta within 24px of viewport
- Above 1024px: keep current collapsible behavior
- Close on backdrop tap

**Files to modify:**
- Modify: `src/components/ShellLayout.tsx`, `src/components/Sidebar.tsx`
- Add CSS for mobile drawer

### Phase 8: Accessibility Audit Follow-up (Not Started)

**From BS0/12-ACCESSIBILITY-USABILITY-AUDIT.md**

**What to do:**
- Verify EntryCard aria-labels on all icon-only buttons
- Verify card focusability with keyboard navigation
- Re-verify contrast ratios for all text
- Test keyboard navigation through dashboard
- Verify form error messages are screen-reader friendly

**Files to verify/modify:**
- Verify: `src/components/EntryCard.tsx`, `src/components/EntryListItem.tsx`, `src/components/CommandPalette.tsx`
- Test: All interactive components

### Deferred from Phase 2 (Requires Vercel Cron Setup)

**From BS/02-BACKEND-AND-DATABASE-UPGRADE.md**

**What to do:**
- Implement `/api/cron/check-links` cron route (weekly job)
- Implement `/api/cron/backup` cron route (weekly backup)
- Configure Vercel cron secrets
- Protect cron routes with secret validation

**Files to create:**
- Create: `src/app/api/cron/check-links/route.ts`
- Create: `src/app/api/cron/backup/route.ts`

### Security Gaps (Documented in SECURITY.md)

**High Priority:**
- Distributed rate limiting on auth/signup/AI endpoints
- MFA challenge enforcement (Supabase supports TOTP, app doesn't enforce it)
- CAPTCHA/bot protection
- Monitoring/error dashboards
- Automated backups and disaster recovery drills

**Medium Priority:**
- Contact/newsletter forms are informational until backend provider connected

---

## 📋 PHASE PLANS (From BS/BS0)

### BS - 01 FRONTEND UPGRADE

- ✅ Mobile sidebar drawer (deferred to Phase 7)
- ✅ Entry card quick actions (completed in Phase 3)
- ✅ Masonry view mode (completed in Phase 3)
- ✅ Skeleton loading states (completed in Phase 3)
- Destructive-action confirm pattern (not started)
- Keyboard shortcuts (completed in Phase 3)
- Extra keyboard shortcuts (completed in Phase 3)

### BS - 02 BACKEND AND DATABASE UPGRADE

- ✅ POST /api/reports (completed in Phase 2)
- ✅ Review queue data source (already implemented)
- ✅ Partial index on published_at (completed in Phase 2)
- Category ownership comment (resolve if needed)
- ⏳ Link health checker cron (deferred - needs Vercel setup)
- ⏳ Automated backup cron (deferred - needs Vercel setup)

### BS - 03 FEATURES AND DASHBOARD UX

- My Submissions status view (not started)
- Duplicate-link warning before submit (not started)
- Quick-add-from-URL entry point (not started)
- Review queue oldest-first sort (not started)
- Review queue visible submission age (not started)
- Review queue keyboard shortcuts (not started)
- Persist view/filter state in URL params (not started)
- Entry count context (not started)
- Category description on category pages (not started)
- Public contributor profile (not started)
- Bulk select mode (not started)

### BS - 04 AI SLOP PREVENTION

- AI-provenance marker in moderator view (not started)
- Vendor-copy similarity warning (not started)
- Per-account autofill rate limit (not started)
- Extraction-only prompt enforcement (already implemented)

### BS0 - 10 REAL FETCH AUTOFILL

- ✅ Real URL content fetching (completed in Phase 4)
- ⏳ Robots.txt checking (completed in Phase 4)
- ✅ Graceful degradation (completed in Phase 4)
- ⏳ Caching (not started - requires Vercel KV/Upstash)

### BS0 - 11 DPDP CONSENT AND AUTH FORMS

- ✅ Consent checkboxes on signup (completed in Phase 5)
- ✅ Privacy request controls in settings (completed in Phase 5)
- ✅ Grievance officer in privacy page (completed in Phase 5)
- Age confirmation (completed in Phase 5)
- Marketing consent (completed in Phase 5)

### BS0 - 09 DYNAMIC TYPES AND CATEGORIES

- Convert entry types to database table (not started - Phase 6)
- Creatable combobox component (not started - Phase 6)
- Entry types management page (not started - Phase 6)

### BS0 - 12 ACCESSIBILITY USABILITY AUDIT

- Fix EntryCard aria-labels (not started - Phase 8)
- Verify card focusability (not started - Phase 8)
- Re-verify contrast ratios (not started - Phase 8)

---

## 🎯 HOW TO RESUME WORK

### If AI Session Dropped During Development

1. **Read this file first** (`UNDERSTANDING.md`) to understand context
2. **Check last commit**: `git log --oneline -5` to see what was last done
3. **Check uncommitted changes**: `git status` to see if there's work in progress
4. **Review TODO list**: If a todo.md exists, it shows pending items
5. **Continue from last completed phase**

### Quick Resume Commands

```bash
# Check current branch and status
cd C:\Users\ASHISH\Desktop\Tech-Utlity\app
git status
git log --oneline -10

# Verify code quality
npm run lint
npm run build

# If build fails, check TypeScript errors
npm run build

# Commit and push when done
git add .
git commit -m "description"
git push
```

### Phase-Specific Entry Points

| If continuing from... | Start with this file |
|----------------------|------------------|
| Phase 3 UX improvements | `src/components/DashboardClient.tsx` |
| Phase 4 AI autofill | `src/app/api/autofill/route.ts` |
| Phase 5 DPDP consent | `src/app/login/page.tsx` |
| Phase 6 Dynamic types | `src/lib/types.ts` (EntryType enum) |
| Phase 7 Mobile drawer | `src/components/ShellLayout.tsx` |
| Phase 8 Accessibility | `src/components/EntryCard.tsx` |
| Backend routes | `src/app/api/` directory |
| Database changes | `database/` directory |

---

## 🔑 CRITICAL PATTERNS & CONVENTIONS

### Code Style

- **No comments** in code (unless clarifying complex logic)
- **No `any` types** - use specific types
- **No console.log** in production code (use only for debugging)
- **Component imports**: Group related imports together
- **CSS**: Use existing tokens from `globals.css` before adding new ones
- **Icons**: Use `lucide-react` only (no second icon library)

### API Route Pattern

Every API route follows this pattern:

```typescript
export async function POST(request: Request) {
  // 1. Validate session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Validate request body
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // 3. Ownership/authorization check
  if (needsOwnershipCheck) {
    const { data: entry } = await supabase.from("entries").select("user_id").eq("id", id).single();
    if (entry.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Perform operation
  const { data, error } = await supabase.from("table").insert(...).select();

  // 5. Return response
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

### Database Query Pattern

Always use Supabase client with proper filters:

```typescript
// Correct - with ownership check
const { data, error } = await supabase
  .from("entries")
  .select("*")
  .eq("user_id", user.id)
  .is("deleted_at", null);

// For public content with RLS
const { data, error } = await supabase
  .from("entries")
  .select("*")
  .eq("status", "PUBLISHED");
```

### Backward Compatibility Pattern

When adding new database columns, check if they exist:

```typescript
let hasStatusColumn = false;
try {
  const { error } = await supabase
    .from("entries")
    .select("status")
    .limit(1);
  hasStatusColumn = !error;
} catch {
  hasStatusColumn = false;
}

if (hasStatusColumn) {
  // New behavior
} else {
  // Legacy behavior
}
```

### CSS Token Usage

Before adding new CSS, check `globals.css` for existing tokens:

```css
/* Use existing tokens */
color: var(--text-primary);
background: var(--bg-card);
border: 1px solid var(--border-card);
```

Existing animations: `fadeIn`, `slideIn`, `bounce-in`, `shimmer`, `shimmer-glow`, `pulse-blue`, `spin`

---

## 🗄️ DATABASE MIGRATION STATUS

See `database/MIGRATION_STATUS.md` for detailed tracking.

**Applied:**
- ✅ schema.sql (base schema)
- ✅ 01-byteshelf-pivot.sql (public library)
- ✅ 02-byteshelf-rls-update.sql (RLS policies)

**May need manual execution:**
- ⏳ 03-add-pricing-columns.sql
- ⏳ 04-seed-data.sql (requires admin UUID replacement)
- ⏳ 05-add-published-index.sql
- ⏳ 06-add-reports-constraint.sql
- ⏳ 07-link-health-checks.sql

**How to apply:**
1. Open SQL file locally
2. Copy all SQL code
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Refresh PostgREST: `NOTIFY pgrst, 'reload schema';`

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "column entries.status does not exist"

**Cause:** Database hasn't received public-library migrations

**Solution:** Apply `database/01-byteshelf-pivot.sql` and `database/02-byteshelf-rls-update.sql` in Supabase SQL Editor

### Issue: Build fails with TypeScript errors

**Cause:** Type mismatch or missing types

**Solution:**
1. Check error message for specific file and line
2. Fix the type issue
3. Run `npm run build` again

### Issue: Lint errors about `any` type

**Cause:** Using `any` instead of specific types

**Solution:** Replace with proper TypeScript types

### Issue: Supabase SQL Editor syntax error

**Cause:** Typing file path instead of SQL code

**Solution:** Copy the actual SQL code from the file, not the file path

### Issue: "Something went wrong" on dashboard

**Cause:** Database schema mismatch or API error

**Solution:**
1. Check Vercel logs for specific error
2. Verify database migrations are applied
3. Check backward compatibility if status column is missing

---

## 📊 CURRENT PROGRESS TRACKING

### Completed Phases

- ✅ **Phase 1:** Database Fixes & Pricing Support
- ✅ **Phase 2:** Backend Enhancements (partial - cron jobs deferred)
- ✅ **Phase 3:** Frontend UX Improvements
- ✅ **Phase 4:** Real URL Content Fetching for AI Autofill
- ✅ **Phase 5:** DPDP Consent Flow

### In Progress

- None

### Pending Phases

- ⏳ **Phase 6:** Dynamic Entry Types & Categories
- ⏳ **Phase 7:** Mobile Sidebar Drawer
- ⏳ **Phase 8:** Accessibility Audit Follow-up

### Deferred (Requires External Setup)

- ⏳ Link health checker cron job (Vercel cron + secret)
- ⏳ Automated backup cron job (Vercel cron + Supabase Storage)
- ⏳ Distributed rate limiting (shared-store like Vercel KV/Upstash)
- ⏳ MFA enforcement (needs Supabase Auth configuration)
- ⏳ Monitoring/error dashboards (external service integration)

---

## 📝 IMPORTANT NOTES FOR AI AGENTS

### Security Requirements

1. **Never expose secrets**: Check for hardcoded API keys, passwords, tokens
2. **Never commit .env.local**: It's in .gitignore, but verify
3. **Use server-side clients** for sensitive operations
4. **Validate all inputs**: Use Zod schemas on all API routes
5. **Check ownership**: Never trust user_id from client, always from server session

### Code Quality

1. **Run lint before committing**: `npm run lint`
2. **Run build before pushing**: `npm run build`
3. **Fix all TypeScript errors**
4. **Fix all ESLint errors/warnings**
5. **No console.log in production code**

### Database Changes

1. **Always create SQL migration file** in `database/` directory
2. **Name migrations sequentially**: 01-, 02-, 03-, etc.
3. **Test migration locally** before production
4. **Update MIGRATION_STATUS.md** after applying
5. **Never DROP tables** in migrations unless documented

### Breaking Changes

1. **Check backward compatibility** when adding new database columns
2. **Test with and without new schema** if possible
3. **Document breaking changes** in README.md
4. **Version appropriately** (semantic versioning)

### Testing

1. **Test locally** before pushing
2. **Test in staging** before production
3. **Verify all user flows**:
   - Public browsing (unauthenticated)
   - Sign up/sign in
   - Create/edit/delete entries
   - Moderation flow
   - Settings changes
   - Data export/import

---

## 🎯 NEXT STEPS (Recommended Order)

1. **Apply pending database migrations** (see MIGRATION_STATUS.md)
2. **Continue with Phase 6** (Dynamic Entry Types)
3. **Continue with Phase 7** (Mobile Sidebar Drawer)
4. **Continue with Phase 8** (Accessibility Audit)
5. **Address security gaps** (rate limiting, MFA, monitoring)
6. **Set up deferred cron jobs** (requires Vercel cron configuration)

---

## 📚 REFERENCE DOCUMENTATION

### Core Documentation

- `README.md` - Project overview and setup instructions
- `SECURITY.md` - Security policy and known gaps
- `PROGRESS.md` - Implementation progress (may be outdated, cross-reference with this file)
- `DATABASE_MIGRATION_GUIDE.md` - How to apply database migrations
- `database/MIGRATION_STATUS.md` - Migration execution tracking

### Upgrade Plans

- `BS/00-CRITICAL-FIXES-AND-MISMATCHES.md` - Critical bugs and mismatches
- `BS/01-FRONTEND-UPGRADE.md` - Frontend improvements
- `BS/02-BACKEND-AND-DATABASE-UNDERGRADE.md` - Backend enhancements
- `BS/03-FEATURES-AND-DASHBOARD-UX.md` - UX improvements
- `BS/04-AI-SLOP-PREVENTION.md` - AI safety guidelines
- `BS/05-DESIGN-SYSTEM-RULES.md` - CSS and design system rules
- `BS/06-TASKS-CHECKLIST.md` - Ordered task checklist

### BS0 (Additional Plans)

- `BS0/07-SEED-DATA.sql` - Seed data (duplicate of database/04-seed-data.sql)
- `BS0/08-SCHEMA-TYPE-MISMATCH.md` - Type/database mismatches (resolved)
- `BS0/09-DYNAMIC-TYPES-AND-CATEGORIES.md` - Dynamic types implementation
- `BS0/10-REAL-FETCH-AUTOFILL.md` - Real URL content fetching (completed)
- `BS0/11-DPDP-CONSENT-AND-AUTH-FORMS.md` - DPDP compliance (completed)
- `BS0/12-ACCESSIBILITY-USABILITY-AUDIT.md` - Accessibility audit checklist

---

## 🔍 TROUBLESHOOTING GUIDE

### Dashboard shows "Something went wrong"

1. Check Vercel logs for specific error
2. Most likely: database schema mismatch
3. Solution: Apply pending migrations in Supabase SQL Editor

### Build fails

1. Check TypeScript error message
2. Fix type mismatch in indicated file
3. Run `npm run build` again

### Lint fails

1. Check ESLint error message
2. Fix the linting issue
3. Run `npm run lint` again

### API returns 401 Unauthorized

1. Check user is signed in
2. Check session is valid
3. Check proxy.ts middleware configuration

### Entry not saving

1. Check form validation errors
2. Check API route for error
3. Check database RLS policies
4. Check ownership verification

### AI autofill not working

1. Check API key is valid
2. Check provider and model are correct
3. Check if URL content fetch failed (degraded gracefully)
4. Check CORS if using custom endpoint

---

## 🎨 DESIGN SYSTEM REFERENCE

### CSS Tokens (from globals.css)

**Colors:**
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--bg-base`, `bg-card`, `bg-card-hover`
- `--border-subtle`, `--border-card`, `border-default`
- `--brand-blue-bright`, `--brand-blue-primary`

**Animations:**
- `fadeIn`, `slideIn`, `bounce-in`, `shimmer`, `shimmer-glow`, `pulse-blue`, `spin`

**Gradients:**
- 4-stop gradients for premium effects
- Use existing patterns before creating new ones

### Component Patterns

**Cards:**
- Use existing card structures (EntryCard, GalleryCard)
- Use existing badge classes (badge-blue, badge-purple, etc.)
- Use TYPE_COLORS for type-specific coloring

**Buttons:**
- Use `btn`, `btn-primary`, `btn-secondary`, `btn-danger`
- Use gradient effects from existing patterns

**Forms:**
- Use `input` class for form fields
- Use validation errors from Zod schemas

---

## 🚀 QUICK START FOR NEW AI SESSION

If you're a new AI agent starting fresh:

1. **Read this file** (UNDERSTANDING.md) - you now have full context
2. **Check last commit**: `git log --oneline -5`
3. **Check status**: `git status`
4. **Decide next phase** based on pending implementation list
5. **Start working** from the appropriate entry point in "KEY FILES TO UNDERSTAND"
6. **Follow code patterns** from "CRITICAL PATTERNS & CONVENTIONS"
7. **Test with lint/build** before committing
8. **Commit and push** when complete

---

## 📞 CONTACT FOR QUESTIONS

If this document is unclear or you need additional context:

- Review BS/ and BS0/ directories for detailed upgrade plans
- Check SECURITY.md for security considerations
- Check README.md for setup instructions
- Check database/MIGRATION_STATUS.md for database state

---

**Last Updated:** October 10, 2026
**Last Commit:** `aedcd8f` - Phase 5 DPDP consent checkboxes
**Next Recommended Phase:** Phase 6 - Dynamic Entry Types & Categories
