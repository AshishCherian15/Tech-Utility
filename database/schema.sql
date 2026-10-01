-- ================================================================
-- Ash-Tech — Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL Editor to set up all tables + RLS.
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- 1. Categories
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT NOT NULL DEFAULT '📂',
  color       TEXT NOT NULL DEFAULT '#3b82f6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: owner full access" ON categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);

-- ----------------------------------------------------------------
-- 2. Entries
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  type             TEXT NOT NULL DEFAULT 'Tip'
                   CHECK (type IN ('Tip','Trick','Hack','App','Website','Tool','Extension','Command','Guide','Prompt')),
  tags             TEXT[] NOT NULL DEFAULT '{}',
  what_it_is       TEXT,
  why_useful       TEXT,
  who_can_use      TEXT,
  when_to_use      TEXT,
  how_to_use       TEXT,
  example          TEXT,
  difficulty       TEXT CHECK (difficulty IN ('Easy','Medium','Hard')),
  platform         TEXT CHECK (platform IN ('Windows','Android','iOS','macOS','Linux','Web','Cross-platform')),
  command_snippet  TEXT,
  images           TEXT[] NOT NULL DEFAULT '{}',
  color            TEXT,
  pinned           BOOLEAN NOT NULL DEFAULT FALSE,
  favorited        BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Full-text search vector (generated, auto-updated)
  search_vector    TSVECTOR GENERATED ALWAYS AS (
    TO_TSVECTOR('english',
      COALESCE(title, '') || ' ' ||
      COALESCE(ARRAY_TO_STRING(tags, ' '), '') || ' ' ||
      COALESCE(command_snippet, '') || ' ' ||
      COALESCE(what_it_is, '') || ' ' ||
      COALESCE(why_useful, '')
    )
  ) STORED
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries: owner full access" ON entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS entries_user_id_idx        ON entries(user_id);
CREATE INDEX IF NOT EXISTS entries_category_id_idx    ON entries(category_id);
CREATE INDEX IF NOT EXISTS entries_deleted_at_idx     ON entries(deleted_at);
CREATE INDEX IF NOT EXISTS entries_search_vector_idx  ON entries USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS entries_created_at_idx     ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS entries_favorited_idx      ON entries(favorited) WHERE favorited = TRUE;
CREATE INDEX IF NOT EXISTS entries_pinned_idx         ON entries(pinned) WHERE pinned = TRUE;

-- ----------------------------------------------------------------
-- 3. Entry Links (per-platform URLs for apps/tools/websites)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_links (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id   UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform   TEXT NOT NULL,   -- e.g. 'Play Store', 'Microsoft Store', 'GitHub', 'Official'
  url        TEXT NOT NULL,
  label      TEXT,            -- optional display override
  verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entry_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entry_links: owner full access" ON entry_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS entry_links_entry_id_idx ON entry_links(entry_id);
CREATE INDEX IF NOT EXISTS entry_links_user_id_idx  ON entry_links(user_id);

-- ----------------------------------------------------------------
-- 4. Entry Versions (last 20 revisions per entry for restore/diff)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entry_versions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,   -- full entry JSON at that point in time
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entry_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entry_versions: owner full access" ON entry_versions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS entry_versions_entry_id_idx ON entry_versions(entry_id, created_at DESC);

-- ----------------------------------------------------------------
-- 5. Usage Events (private, owner-only usage tracking)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id   UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'view',   -- 'view' | 'copy' | 'export'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_events: owner full access" ON usage_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS usage_events_entry_id_idx ON usage_events(entry_id);
CREATE INDEX IF NOT EXISTS usage_events_user_id_idx  ON usage_events(user_id, created_at DESC);

-- ----------------------------------------------------------------
-- 6. Auto-update updated_at via trigger
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------
-- 7. Supabase Storage bucket (run once, or create in the dashboard)
-- ----------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('entry-images', 'entry-images', false)
--   ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "entry-images: owner access" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'entry-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ----------------------------------------------------------------
-- 8. Trash auto-purge (call from a scheduled Vercel Cron / GitHub Action)
-- ----------------------------------------------------------------
-- DELETE FROM entries
--   WHERE deleted_at IS NOT NULL
--     AND deleted_at < NOW() - INTERVAL '30 days';
