-- ================================================================
-- ByteShelf — Add Partial Index for Published Entries
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- Add partial index for published entries sorting
-- This optimizes the public library query that sorts by published_at
CREATE INDEX IF NOT EXISTS entries_published_at_idx
  ON entries(published_at DESC)
  WHERE status = 'PUBLISHED';
