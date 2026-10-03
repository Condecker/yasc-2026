# CTS YASC 2026 Prep Guide

Mobile-first reference and shared schedule for the CTS booth team at YASC 2026 (San Diego, Oct 7 to 9).

- Static site, no build. `site/` is what Netlify publishes.
- Shared schedule state in Supabase (`supabase/schema.sql`), realtime sync via `site/storage.js`.
- Setup and conventions: see `CLAUDE.md`.

Quick start:
1. Run `supabase/schema.sql` in your Supabase project.
2. Put the project URL and anon key in `site/config.js`.
3. Deploy the repo to Netlify with publish directory `site`.
