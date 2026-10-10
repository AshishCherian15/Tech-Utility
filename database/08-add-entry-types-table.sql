-- Migration: Add entry_types table for dynamic type management
-- This replaces the hardcoded EntryType enum with a database-driven system
-- Allows admins to create, edit, and deactivate entry types without code changes

-- Create entry_types table
CREATE TABLE IF NOT EXISTS public.entry_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT 'blue',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.entry_types IS 'Dynamic entry types (replaces hardcoded enum)';

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_entry_types_active_sort ON public.entry_types(is_active, sort_order);

-- Seed with initial types matching the existing enum
INSERT INTO public.entry_types (name, description, icon, color, sort_order) VALUES
  ('command', 'Terminal commands and CLI tools', 'terminal', 'blue', 1),
  ('app', 'Desktop applications and GUI tools', 'monitor', 'purple', 2),
  ('website', 'Web applications and online services', 'globe', 'green', 3),
  ('extension', 'Browser extensions and plugins', 'puzzle', 'orange', 4),
  ('library', 'Code libraries and frameworks', 'code', 'pink', 5),
  ('workflow', 'Automations and processes', 'workflow', 'cyan', 6),
  ('guide', 'Tutorials and documentation', 'book', 'yellow', 7),
  ('tool', 'Utilities and helper tools', 'wrench', 'gray', 8)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.entry_types ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active entry types
CREATE POLICY "Active entry types are publicly readable"
  ON public.entry_types
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert new types
CREATE POLICY "Only admins can create entry types"
  ON public.entry_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND email = (SELECT value FROM (
        SELECT current_setting('app.admin_email', true) AS value
      ) WHERE value IS NOT NULL)
    )
  );

-- Policy: Only admins can update types
CREATE POLICY "Only admins can update entry types"
  ON public.entry_types
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND email = (SELECT value FROM (
        SELECT current_setting('app.admin_email', true) AS value
      ) WHERE value IS NOT NULL)
    )
  );

-- Policy: Only admins can delete types
CREATE POLICY "Only admins can delete entry types"
  ON public.entry_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND email = (SELECT value FROM (
        SELECT current_setting('app.admin_email', true) AS value
      ) WHERE value IS NOT NULL)
    )
  );

-- Set admin email as a session variable (run this in your Supabase dashboard SQL Editor)
-- SET app.admin_email TO 'your-admin-email@example.com';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entry_types_updated_at
  BEFORE UPDATE ON public.entry_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
