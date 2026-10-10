-- ================================================================
-- ByteShelf — Link Health Checks Table
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- Create link health checks table
CREATE TABLE IF NOT EXISTS public.link_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status_code INT,
  ok BOOLEAN NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.link_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view link health" ON public.link_health_checks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR','ADMIN'))
  );

CREATE POLICY "System can write link health" ON public.link_health_checks
  FOR INSERT WITH CHECK (true);

-- Index for querying health checks by entry
CREATE INDEX IF NOT EXISTS link_health_checks_entry_id_idx
  ON link_health_checks(entry_id, checked_at DESC);

-- Index for finding broken links
CREATE INDEX IF NOT EXISTS link_health_checks_ok_idx
  ON link_health_checks(ok) WHERE ok = false;
