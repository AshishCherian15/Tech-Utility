-- ================================================================
-- ByteShelf Pivot — Additive Schema Changes
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- 1. Enums
CREATE TYPE role_type AS ENUM ('VISITOR', 'CONTRIBUTOR', 'TRUSTED_CONTRIBUTOR', 'MODERATOR', 'ADMIN');
CREATE TYPE entry_status AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'FLAGGED');

-- 2. Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role role_type NOT NULL DEFAULT 'CONTRIBUTOR',
    display_name TEXT,
    bio TEXT,
    public_profile BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (public_profile = TRUE);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a public.users row when a new auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- For existing users, backfill the users table
INSERT INTO public.users (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Assign ADMIN role to the existing owner (if they have 'owner' in raw_app_meta_data)
UPDATE public.users 
SET role = 'ADMIN'
WHERE id IN (
  SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'owner'
);

-- 3. Modify Entries table
ALTER TABLE public.entries 
    ADD COLUMN IF NOT EXISTS status entry_status NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS reviewed_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS hero_tag TEXT,
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

CREATE INDEX IF NOT EXISTS entries_status_idx ON entries(status);

-- 4. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
    reported_by_id UUID NOT NULL REFERENCES public.users(id),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reported_by_id);
CREATE POLICY "Moderators can view reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
);

-- 5. Moderation Action log
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID NOT NULL REFERENCES public.users(id),
    entry_id UUID REFERENCES public.entries(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Moderators can view actions" ON public.moderation_actions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
);

-- 6. Update Entries RLS for Public Access and Moderation
DROP POLICY IF EXISTS "entries: owner full access" ON entries;

-- Anyone can view PUBLISHED entries
CREATE POLICY "Anyone can view published entries" ON entries
  FOR SELECT USING (status = 'PUBLISHED');

-- Authors can view all their own entries (DRAFT, PENDING, REJECTED, etc.)
CREATE POLICY "Authors can view own entries" ON entries
  FOR SELECT USING (auth.uid() = user_id);

-- Moderators and Admins can view ALL entries (including PENDING)
CREATE POLICY "Moderators can view all entries" ON entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
  );

-- Authors can insert/update their own DRAFT or PENDING entries
CREATE POLICY "Authors can create entries" ON entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own entries" ON entries
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Moderators and Admins can update any entry (e.g., to approve/reject)
CREATE POLICY "Moderators can update any entry" ON entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
  );

-- Authors can delete their own entries
CREATE POLICY "Authors can delete own entries" ON entries
  FOR DELETE USING (auth.uid() = user_id);

-- Moderators and Admins can delete any entry
CREATE POLICY "Moderators can delete any entry" ON entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN'))
  );
