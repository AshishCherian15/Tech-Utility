-- ================================================================
-- ByteShelf — Add Reports Unique Constraint
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- Add unique constraint to prevent duplicate reports from same user on same entry
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reports_unique_reporter'
      AND conrelid = 'public.reports'::regclass
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_unique_reporter UNIQUE (entry_id, reported_by_id);
  END IF;
END $$;
