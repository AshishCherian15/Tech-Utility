-- ================================================================
-- ByteShelf — Add Pricing Columns
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- Add pricing and pricing_note columns to entries table
ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid')),
  ADD COLUMN IF NOT EXISTS pricing_note TEXT;

-- Add index for pricing filtering (useful for the public library view)
CREATE INDEX IF NOT EXISTS entries_pricing_idx ON entries(pricing) WHERE pricing IS NOT NULL;
