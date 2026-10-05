-- Seed entries for CodeFronts.com & Windows Clipboard (Win + V)
-- Run this in Supabase SQL Editor if you want pre-populated sample entries.

WITH owner AS (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
), inserted_entry AS (
  INSERT INTO entries (
    user_id, title, type, tags, what_it_is, why_useful,
    how_to_use, platform
  )
  SELECT
    id,
    'CodeFronts.com — Frontend Component Library & UI Gallery',
    'Website',
    ARRAY['frontend', 'ui', 'css', 'design', 'components'],
    'A modern web gallery featuring ready-to-use HTML/CSS code snippets, component patterns, and front-end design resources.',
    'Save hours when building responsive layouts and animated landing page hero sections.',
    'Visit codefronts.com, browse UI components, and copy HTML/CSS directly into your Next.js project.',
    'Web'
  FROM owner
  RETURNING id, user_id
)
INSERT INTO entry_links (entry_id, user_id, platform, url, label, verified)
SELECT id, user_id, 'Official', 'https://codefronts.com', 'CodeFronts.com', FALSE
FROM inserted_entry;

INSERT INTO entries (
  user_id,
  title,
  type,
  tags,
  what_it_is,
  why_useful,
  how_to_use,
  platform,
  command_snippet
)
SELECT
  id as user_id,
  'Windows Clipboard History — Multi-Item Copy & Paste',
  'Trick',
  ARRAY['windows', 'shortcut', 'productivity', 'clipboard'],
  'Built-in Windows feature that stores multiple copied texts and screenshots in history.',
  'Allows pasting previously copied text, code snippets, or screenshots without losing your current clipboard.',
  'Press Windows Key + V on your keyboard to open the floating clipboard popup.',
  'Windows',
  'Win + V'
FROM auth.users
LIMIT 1;
