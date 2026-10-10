-- ================================================================
-- ByteShelf — Seed Data: Categories + Sample Entries
-- Run this in the Supabase SQL Editor.
-- ================================================================

-- IMPORTANT: Replace OWNER_ID below with your actual admin user's UUID first:
--   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
--
-- Run the SELECT above, copy the UUID, and replace 'PASTE_YOUR_ADMIN_USER_UUID_HERE' below.

DO $$
DECLARE
  owner_id UUID := 'PASTE_YOUR_ADMIN_USER_UUID_HERE';
  cat_windows UUID;
  cat_dev UUID;
  cat_websites UUID;
  cat_ai UUID;
  cat_apps UUID;
  cat_student UUID;
  cat_guides UUID;
BEGIN

  -- ---- Categories ----
  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Windows Tips & Commands', 'CMD/PowerShell commands, shortcuts, troubleshooting, hidden features.', '🪟', '#0ea5e9')
  RETURNING id INTO cat_windows;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Developer Tools', 'Git, VS Code, APIs, debugging, testing, free hosting.', '🧑‍💻', '#6366f1')
  RETURNING id INTO cat_dev;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Useful Websites', 'File conversion, image editing, productivity, privacy, writing.', '🌐', '#14b8a6')
  RETURNING id INTO cat_websites;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'AI Tools', 'Assistants, coding tools, research tools, image generators.', '🤖', '#a855f7')
  RETURNING id INTO cat_ai;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Apps & Extensions', 'Windows/Android apps, Chrome extensions, productivity utilities.', '📱', '#f59e0b')
  RETURNING id INTO cat_apps;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Student Resources', 'Free learning platforms, certifications, resume & interview tools.', '🎓', '#22c55e')
  RETURNING id INTO cat_student;

  INSERT INTO categories (user_id, name, description, icon, color)
  VALUES (owner_id, 'Tutorials & Guides', 'Step-by-step instructions, lesser-known features, how-tos.', '📘', '#ef4444')
  RETURNING id INTO cat_guides;

  -- ---- Sample Entries (one per entry type) ----
  INSERT INTO entries (user_id, title, category_id, type, tags, what_it_is, why_useful,
                        who_can_use, when_to_use, how_to_use, example, difficulty, platform,
                        command_snippet, pinned, status, hero_tag, pricing, pricing_note, published_at)
  VALUES
  (owner_id, 'Instantly reopen a closed browser tab', cat_websites, 'Tip',
   ARRAY['browser','shortcut','productivity'],
   'A keyboard shortcut that reopens the last tab you closed, in any Chromium/Firefox browser.',
   'Saves the panic of losing a tab you needed, without digging through History.',
   'Everyone', 'Whenever you accidentally close a tab you still needed.',
   'Press Ctrl+Shift+T (Cmd+Shift+T on Mac). Press it repeatedly to reopen several tabs in order.',
   'Closed a form you were filling out — Ctrl+Shift+T brings it straight back.',
   'Easy', 'Cross-platform', NULL, true, 'PUBLISHED', 'Reopen Closed Tab', 'free', NULL, NOW()),

  (owner_id, 'Preview any file without opening its app', cat_windows, 'Trick',
   ARRAY['windows','file-explorer','preview'],
   'Windows File Explorer''s built-in Preview Pane shows a file''s contents without launching the full app.',
   'Checking a PDF, image, or text file is instant instead of waiting for an app to load.',
   'Windows users', 'Browsing a folder full of files and only needing a quick look.',
   'In File Explorer, go to View > Show > Preview Pane (or press Alt+P). Click any file to preview it in the side panel.',
   'Flip through 20 screenshots in a folder in seconds without opening Photos each time.',
   'Easy', 'Windows', NULL, false, 'PUBLISHED', 'Preview Pane', 'free', NULL, NOW()),

  (owner_id, 'Recover unsaved Office files after a crash', cat_windows, 'Hack',
   ARRAY['windows','office','recovery'],
   'Office apps auto-save a temp copy you can recover even if you never hit Save.',
   'Turns "I lost 2 hours of work" into a 1-minute recovery.',
   'Anyone using Word/Excel/PowerPoint', 'Right after a crash or an accidental close without saving.',
   'Reopen the app — it usually offers a "Document Recovery" pane automatically. If not: File > Info > Manage Document > Recover Unsaved Documents.',
   'Word crashes mid-essay — reopening Word shows the recovered draft in the sidebar.',
   'Easy', 'Windows', NULL, false, 'PUBLISHED', 'Unsaved File Recovery', 'free', NULL, NOW()),

  (owner_id, 'Obsidian', cat_apps, 'App',
   ARRAY['notes','markdown','offline'],
   'A local-first markdown note-taking app that links notes together like a personal wiki.',
   'Keeps your notes as plain files on your own disk — no lock-in, works offline, fast search across everything you''ve written.',
   'Students, developers, writers', 'Building a long-term personal knowledge base rather than scattered one-off notes.',
   'Download, point it at a folder, start writing in Markdown. Use [[double brackets]] to link notes together.',
   'Linking lecture notes to a glossary note so clicking a term jumps straight to its definition.',
   'Medium', 'Cross-platform', NULL, false, 'PUBLISHED', 'Markdown Note-Taking', 'freemium', 'Free for personal use; sync/publish are paid add-ons.', NOW()),

  (owner_id, 'Excalidraw', cat_websites, 'Website',
   ARRAY['diagrams','whiteboard','design'],
   'A free online whiteboard for quick, hand-drawn-style diagrams and sketches.',
   'Faster than opening a full design tool when you just need to sketch an idea or explain a flow.',
   'Developers, students, anyone explaining an idea visually', 'Sketching a system diagram, flowchart, or quick wireframe.',
   'Go to excalidraw.com, start drawing immediately — no signup required. Export as PNG/SVG when done.',
   'Sketching an API request/response flow during a team call screen-share.',
   'Easy', 'Web', NULL, false, 'PUBLISHED', 'Online Whiteboard', 'free', NULL, NOW()),

  (owner_id, 'ripgrep (rg)', cat_dev, 'Tool',
   ARRAY['cli','search','developer'],
   'A command-line search tool like grep, but dramatically faster and respects .gitignore by default.',
   'Searching a large codebase for a string finishes almost instantly instead of taking minutes.',
   'Developers', 'Searching across a big repo from the terminal instead of waiting on your editor''s search.',
   'Install via your package manager, then run rg "searchTerm" in any project folder.',
   'rg "TODO" src/ instantly lists every TODO comment across the whole project.',
   'Medium', 'Cross-platform', 'rg "searchTerm" ./src', false, 'PUBLISHED', 'Fast Code Search', 'free', NULL, NOW()),

  (owner_id, 'uBlock Origin', cat_apps, 'Extension',
   ARRAY['chrome','privacy','ad-blocker'],
   'A lightweight, open-source ad and tracker blocker for Chrome/Firefox/Edge.',
   'Pages load faster and you''re not tracked by ad networks across every site you visit.',
   'Everyone', 'Browsing any site with heavy ads or you want to reduce tracking.',
   'Install from your browser''s extension store, pin it to the toolbar — works out of the box, no setup needed.',
   'A news site that used to take 8 seconds to load now loads in 2.',
   'Easy', 'Cross-platform', NULL, true, 'PUBLISHED', 'Ad & Tracker Blocker', 'free', NULL, NOW()),

  (owner_id, 'Find and kill a process locking a port (Windows)', cat_windows, 'Command',
   ARRAY['windows','cmd','networking'],
   'A two-command combo to find which process is using a port and stop it.',
   'Fixes "port already in use" errors without restarting your whole machine.',
   'Developers running local servers', 'A dev server won''t start because the port is already taken.',
   'Run the find command, note the PID in the last column, then kill it.',
   'Port 3000 stuck from a crashed Next.js dev server — this frees it in two commands.',
   'Medium', 'Windows', E'netstat -ano | findstr :3000\ntaskkill /PID <pid> /F', false, 'PUBLISHED', 'Free a Stuck Port', 'free', NULL, NOW()),

  (owner_id, 'Set up a free CI pipeline for a new repo', cat_dev, 'Guide',
   ARRAY['github-actions','ci','devops'],
   'A walkthrough for adding automatic testing/linting on every push, for free, using GitHub Actions.',
   'Catches broken code before it merges, without paying for CI infrastructure.',
   'Developers starting a new project', 'Right after creating a new GitHub repo, before the codebase grows large.',
   'Create .github/workflows/ci.yml in your repo root, define a job that checks out code, installs dependencies, and runs test/lint commands, then push — Actions runs automatically on every push/PR.',
   'A solo side-project repo now blocks merging any PR that fails lint or tests, automatically.',
   'Medium', 'Cross-platform', NULL, false, 'PUBLISHED', 'Free CI with GitHub Actions', 'free', 'Free tier covers generous minutes/month for public and most private repos.', NOW()),

  (owner_id, 'Explain-like-I''m-debugging prompt', cat_ai, 'Prompt',
   ARRAY['ai','debugging','prompt-engineering'],
   'A reusable prompt template for getting an AI assistant to actually debug with you instead of just restating the error.',
   'Gets more useful answers than pasting a stack trace alone — forces the model to ask about context it''s missing.',
   'Developers using any AI coding assistant', 'Stuck on a bug and the first AI answer didn''t fix it.',
   'Paste the template, fill in the blanks, send it before pasting your actual error.',
   'Used before debugging a flaky test — the AI asks about test isolation instead of guessing at the stack trace.',
   'Easy', 'Cross-platform',
   'I''m debugging [language/framework]. Here''s the error: [paste error]. Here''s the relevant code: [paste code]. Before suggesting a fix, ask me about anything you''re uncertain of (recent changes, environment, what I''ve already tried).',
   false, 'PUBLISHED', 'Better Debugging Prompts', 'free', NULL, NOW());

  RAISE NOTICE 'Seed data inserted successfully for user: %', owner_id;
END $$;
