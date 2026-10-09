-- ================================================================
-- ByteShelf Pivot — RLS Updates for Related Tables
-- Run this in the Supabase SQL Editor AFTER 01-byteshelf-pivot.sql
-- ================================================================

-- 1. Categories RLS
DROP POLICY IF EXISTS "categories: owner full access" ON categories;

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Authors can create categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);


-- 2. Entry Links RLS
DROP POLICY IF EXISTS "entry_links: owner full access" ON entry_links;

-- Anyone can view links for PUBLISHED entries
CREATE POLICY "Anyone can view links for published entries" ON entry_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.entries WHERE id = entry_links.entry_id AND status = 'PUBLISHED')
  );

-- Authors can view all links for their own entries
CREATE POLICY "Authors can view links for own entries" ON entry_links
  FOR SELECT USING (auth.uid() = user_id);

-- Moderators can view all links
CREATE POLICY "Moderators can view all links" ON entry_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
  );

-- Authors can manage their own links
CREATE POLICY "Authors can insert own links" ON entry_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own links" ON entry_links
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete own links" ON entry_links
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Entry Versions RLS
DROP POLICY IF EXISTS "entry_versions: owner full access" ON entry_versions;

CREATE POLICY "Authors can manage own entry versions" ON entry_versions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can view entry versions" ON entry_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
  );

-- 4. Usage Events RLS (Private to author / admin)
DROP POLICY IF EXISTS "usage_events: owner full access" ON usage_events;

CREATE POLICY "Authors can manage own usage events" ON usage_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
