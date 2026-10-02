-- Seed entries for CodeFronts.com & Windows Clipboard (Win + V)
-- Run this in Supabase SQL Editor if you want pre-populated sample entries.

INSERT INTO entries (
  user_id,
  title,
  type,
  tags,
  what_it_is,
  why_useful,
  how_to_use,
  platform,
  images,
  command_snippet,
  url
)
SELECT
  id as user_id,
  'CodeFronts.com — Frontend Component Library & UI Gallery',
  'Website',
  ARRAY['frontend', 'ui', 'css', 'design', 'components'],
  'A modern web gallery featuring ready-to-use HTML/CSS code snippets, component patterns, and front-end design resources.',
  'Save hours when building responsive layouts and animated landing page hero sections.',
  'Visit codefronts.com, browse UI components, and copy HTML/CSS directly into your Next.js project.',
  'Web',
  ARRAY['/CodeFronts.com.png'],
  'https://codefronts.com',
  'https://codefronts.com'
FROM auth.users
LIMIT 1;

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
