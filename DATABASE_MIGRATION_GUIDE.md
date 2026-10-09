# Database Migration Guide

## Important: Apply Migrations to Production

The ByteShelf application now includes backward compatibility for the `status` column added in the public-library migration. However, to enable the full public-library features (published entries, moderation, public browsing), you must apply the database migrations to your production Supabase project.

## Current State

- ✅ Code is backward compatible - works with or without the status column
- ⚠️ Production database likely still uses the old private-library schema
- 📋 New features (public entries, moderation) require migration

## Migration Steps

### 1. Verify Your Supabase Project

Before running any SQL, verify you're working with the correct Supabase project:

```bash
# Check your environment variables
echo NEXT_PUBLIC_SUPABASE_URL
echo NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Apply Migrations in Order

Run these SQL files in the Supabase SQL Editor **in order**:

1. `database/schema.sql` - Base schema (should already be applied)
2. `database/01-byteshelf-pivot.sql` - Public-library migration
3. `database/02-byteshelf-rls-update.sql` - RLS updates for public library

#### File: `database/01-byteshelf-pivot.sql`

This adds:
- `public.users` table (extends auth.users)
- `status` column to `entries` table (DRAFT, PENDING, PUBLISHED, REJECTED, FLAGGED)
- `reports` table for duplicate-report prevention
- `moderation_actions` table for audit log
- New RLS policies for public access
- Indexes for published-entry sorting

#### File: `database/02-byteshelf-rls-update.sql`

This updates:
- Categories RLS (public read)
- Entry links RLS (public read for published entries)
- Entry versions RLS
- Usage events RLS

### 3. Verify Migration Success

After applying the migrations, run these verification queries:

```sql
-- Check if status column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entries' AND column_name = 'status';

-- Check if users table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'users' AND table_schema = 'public';

-- Check if reports table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'reports' AND table_schema = 'public';

-- Check RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE relname IN ('entries', 'categories', 'users', 'reports')
  AND pg_namespace.nspname = 'public';
```

Expected results:
- `status` column with type `entry_status` enum
- `users` table exists
- `reports` table exists
- All tables have `relrowsecurity = true`

### 4. Refresh PostgREST Schema Cache

```sql
NOTIFY pgrst, 'reload schema';
```

### 5. Verify Public-Library Behavior

After migration, the application will automatically:
- Show published entries to all visitors
- Show user's own drafts + published entries on dashboard
- Enable moderation features for MODERATOR/ADMIN roles
- Enable public entry pages at `/entry/[id]`
- Enable public category pages at `/category/[slug]`

## Rollback Plan

If you need to rollback:

```sql
-- This is destructive - only run if you have a backup
DROP TABLE IF EXISTS public.moderation_actions CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remove status column and related columns from entries
ALTER TABLE public.entries
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS reviewed_by_id,
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS published_at,
  DROP COLUMN IF EXISTS hero_tag,
  DROP COLUMN IF EXISTS cover_image_url;

-- Drop indexes
DROP INDEX IF EXISTS entries_status_idx;
DROP INDEX IF EXISTS entries_published_at_idx;

-- Drop types
DROP TYPE IF EXISTS entry_status CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;

-- Restore old RLS policies (from schema.sql)
-- You'll need to re-run the policies from schema.sql
```

**Important:** Always backup your database before running migrations.

## After Migration

Once migrations are applied:
1. The application will automatically detect the status column
2. Public-library features will activate without code changes
3. Existing entries will have status = 'DRAFT' by default
4. You'll need to publish entries manually or update them to 'PUBLISHED'

## Update Existing Entries

After migration, you may want to publish existing entries:

```sql
-- Set all existing entries to PUBLISHED (if appropriate)
UPDATE public.entries
SET status = 'PUBLISHED',
    published_at = created_at
WHERE status = 'DRAFT';
```

Or review each entry individually and set appropriate status.

## Support

If you encounter issues:
1. Check the Vercel logs for database errors
2. Verify the migration was applied completely
3. Check RLS policies are correctly configured
4. Ensure PostgREST schema cache was refreshed
