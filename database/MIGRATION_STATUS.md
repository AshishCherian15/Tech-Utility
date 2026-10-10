# ByteShelf Database Migration Status

This document tracks which database migrations have been applied to the production Supabase database.

## ✅ Applied Migrations

These migrations have been confirmed applied to the production database:

### 1. Base Schema
- **File:** `database/schema.sql`
- **Status:** ✅ Applied
- **Applied:** Before public-library pivot
- **Creates:** `categories`, `entries`, `entry_links`, `entry_versions`, `usage_events` tables
- **Note:** Private-library schema with basic RLS

### 2. Public Library Pivot
- **File:** `database/01-byteshelf-pivot.sql`
- **Status:** ✅ Applied
- **Applied:** October 9, 2026
- **Creates:** `public.users` table, moderation fields on entries, reports table, moderation_actions table
- **Adds:** `status`, `reviewed_by_id`, `reviewed_at`, `rejection_reason`, `published_at`, `hero_tag`, `cover_image_url` to entries
- **Purpose:** Converts app from private vault to public reviewed library

### 3. RLS Updates
- **File:** `database/02-byteshelf-rls-update.sql`
- **Status:** ✅ Applied
- **Applied:** October 9, 2026
- **Updates:** RLS policies for public-library model
- **Purpose:** Enforces public reads (PUBLISHED only), author draft management, moderator access

## ⏳ Pending Migrations

These migration files exist but may not have been applied to production yet. Verify and apply if needed:

### 4. Pricing Columns
- **File:** `database/03-add-pricing-columns.sql`
- **Status:** ⏳ Verify in production
- **Adds:** `pricing` column (enum: free, freemium, paid), `pricing_note` column
- **Adds:** Index on pricing for filtering
- **Code Impact:** EntryForm, EntryCard, EntryDetail, DashboardClient already updated to use these fields
- **How to Apply:** Copy SQL contents → Supabase SQL Editor → Run

### 5. Seed Data
- **File:** `database/04-seed-data.sql`
- **Status:** ⏳ Verify in production
- **Adds:** 8 categories (AI Tools, Development, Design, Productivity, Security, DevOps, Mobile, Web)
- **Adds:** 10 sample published entries
- **Requirement:** Replace `PASTE_YOUR_ADMIN_USER_UUID_HERE` with actual admin UUID before running
- **How to Apply:**
  1. Get admin UUID: `SELECT id FROM auth.users WHERE email = 'your-email@example.com';`
  2. Replace placeholder in SQL file
  3. Copy SQL contents → Supabase SQL Editor → Run

### 6. Published Entry Index
- **File:** `database/05-add-published-index.sql`
- **Status:** ⏳ Verify in production
- **Adds:** Partial index on `entries(published_at DESC)` where `status = 'PUBLISHED'`
- **Purpose:** Optimizes public library query performance
- **How to Apply:** Copy SQL contents → Supabase SQL Editor → Run

### 7. Reports Constraint
- **File:** `database/06-add-reports-constraint.sql`
- **Status:** ⏳ Verify in production
- **Adds:** Unique constraint on `(entry_id, user_id)` in reports table
- **Purpose:** Prevents duplicate reports from same user on same entry
- **Code Impact:** POST `/api/reports` route already implemented
- **How to Apply:** Copy SQL contents → Supabase SQL Editor → Run

### 8. Link Health Checks
- **File:** `database/07-link-health-checks.sql`
- **Status:** ⏳ Verify in production
- **Adds:** `link_health_checks` table with RLS policies
- **Purpose:** Stores link health check results for future cron job
- **Note:** Cron job route not yet implemented (requires Vercel cron setup)
- **How to Apply:** Copy SQL contents → Supabase SQL Editor → Run

### 9. Entry Types Table
- **File:** `database/08-add-entry-types-table.sql`
- **Status:** ⏳ Verify in production
- **Adds:** `entry_types` table with RLS policies
- **Seeds:** 8 default entry types (command, app, website, extension, library, workflow, guide, tool)
- **Purpose:** Dynamic entry type management (replaces hardcoded enum)
- **Code Impact:** EntryForm, DashboardClient, EntryTypesClient already updated
- **How to Apply:** Copy SQL contents → Supabase SQL Editor → Run

## 📋 Verification Steps

To verify which migrations are applied in your production Supabase:

```sql
-- Check if pricing columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entries' AND column_name IN ('pricing', 'pricing_note');

-- Check if published index exists
SELECT indexname
FROM pg_indexes
WHERE tablename = 'entries' AND indexname LIKE '%published%';

-- Check if reports constraint exists
SELECT conname
FROM pg_constraint
WHERE conname LIKE '%report%';

-- Check if link_health_checks table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'link_health_checks' AND table_schema = 'public';

-- Check seed data categories
SELECT COUNT(*) FROM categories;

-- Check seed data entries
SELECT COUNT(*) FROM entries WHERE status = 'PUBLISHED';

-- Check if entry_types table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'entry_types' AND table_schema = 'public';

-- Check entry types count
SELECT COUNT(*) FROM entry_types WHERE is_active = true;
```

## 🔧 How to Apply Pending Migrations

1. Open the SQL file locally (e.g., `database/03-add-pricing-columns.sql`)
2. Select all text (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to Supabase SQL Editor
5. Paste (Ctrl+V)
6. Click "Run"
7. Wait for "Success. No rows returned" message
8. Repeat for each pending migration

**Important:** Do NOT type the file path (e.g., `database/03-add-pricing-columns.sql`) into the SQL Editor. Copy and paste the actual SQL code.

## 📊 Migration Execution Order

Always apply migrations in this order:

1. `database/schema.sql` (base schema)
2. `database/01-byteshelf-pivot.sql` (public library pivot)
3. `database/02-byteshelf-rls-update.sql` (RLS updates)
4. `database/03-add-pricing-columns.sql` (pricing support)
5. `database/04-seed-data.sql` (sample data - requires admin UUID)
6. `database/05-add-published-index.sql` (performance index)
7. `database/06-add-reports-constraint.sql` (reports constraint)
8. `database/07-link-health-checks.sql` (link health table)
9. `database/08-add-entry-types-table.sql` (dynamic entry types)

After applying any migration, refresh PostgREST schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

## 🔄 Rollback Plan

If a migration causes issues:

1. Identify the problematic migration
2. Write a reversal SQL (DROP columns, DROP tables, etc.)
3. Test reversal in staging first
4. Apply reversal in production
5. Document the rollback in this file

Never drop the base schema tables or the public-library pivot (01, 02) - these are foundational to the app.

## 📝 Last Updated

October 10, 2026 - Initial migration status tracking
