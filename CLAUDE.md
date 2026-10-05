# CTS YASC 2026 Prep Guide

Static single-page site for a two-person conference team (Claudia and Emily). Deployed on Netlify; the
Schedule tab's shared state lives in one Supabase row and syncs in real time between devices.

## Layout
- `site/index.html` — the whole app (CSS, HTML, JS inline). Tabs: Home, Daily read, Talk tracks, Playbook, Modules, Prep, Schedule.
- `site/storage.js` — Supabase adapter. Exposes `window.ScheduleStore = { subscribe(onData, onError), save(state) }`.
- `site/config.js` — Supabase URL, anon key, schedule row id. Edit this; do not hardcode keys elsewhere.
- `supabase/schema.sql` — table, realtime publication, RLS policies, seed row.
- `netlify.toml` — publish dir and headers. No build step.

## How the Schedule state works
- `state = { sessions: [...], picks: { [sessionId]: { c: mode, e: mode } }, seedRev: n }`.
  `mode` is `none | all | first | second`. `c` = Claudia, `e` = Emily.
- A `SEED` array inside `index.html` holds the loaded agenda (Wed and Thu, plus an 8:00 AM to 5:00 PM booth block per day).
  The schedule covers Wed and Thu only; Friday is the close-down morning (see Prep) and is not scheduled. Imports skip Friday sessions,
  and `migrate()` rev 3 removes any Friday sessions and picks already in the shared row.
  `mergeSeed()` adds any seed session missing from state by `day|start|title`; `migrate()` applies one-time fixes keyed by `seedRev`.
- Persistence: `persist()` writes localStorage immediately and debounces `store.save()` 500 ms.
  `store.subscribe()` delivers the remote row on load and on every change; the first delivery merges local picks over remote.
  While a save is pending (`saveTimer` set) remote deliveries are ignored to avoid clobbering a tap.
- Sessions with `track === 'Booth'` render as a background band and are excluded from conflict and coverage math.
- The importer (`parseYardi`) reads text copied from the Yardi Events agenda page; it attaches descriptions to existing
  sessions matched by `day|start|room` instead of duplicating them.

## Local dev
- Any static server works: `npx serve site` or `python3 -m http.server -d site 8000`.
- Without `config.js` values the page runs in device-only mode (localStorage). That is the expected state until Supabase is set up.

## Deploy checklist
1. Supabase: create a project, run `supabase/schema.sql` in the SQL editor, copy Project URL and anon key into `site/config.js`.
2. Netlify: new site from this repo, publish directory `site`, no build command (netlify.toml already says so).
3. Open the site on two devices, pick a session on one, confirm the other updates within a second and the status line reads "Saved and shared".

## Passcode gate
`index.html` shows a passcode screen on first visit. `CLAUDIA_CODE` (default 3333) and `EMILY_CODE` (default 8888) each
enable editing and set `window.YASC_USER` to `c` or `e`. `PAUL_CODE` (default 2222) is view only but greets Paul by name
(`YASC_USER` = `p`; Paul is not attending, so Home shows both Claudia and Emily). `VIEW_CODE` (default 5555) opens the site read-only with no name
(`body.view-only`, `window.YASC_MODE`, every write path checks `canEdit()`). The choice is remembered in localStorage
(`yasc-mode`, `yasc-user`); the pill in the top bar shows the name and reopens the gate. Codes live in `site/config.js`.
This is a client-side convenience, not security: the anon key can still write the row directly. For real protection
see Access below.

## Home tab
The page always opens on Home. It greets the signed-in person, shows the date and time in San Diego, a countdown to the
booth opening (Oct 7, 8:00 AM PT), Day 1 or 2 of 2 during the event, and Right now / Up next / Later today for both people. All times are Pacific.
- The schedule script exposes `window.YascSched` (read-only helpers) and fires a `yasc-sched` event on every render;
  the gate fires `yasc-user`. Home re-renders on both, and each minute while visible.
- Status rules: inside a picked non-booth session = that session; otherwise inside booth hours = at the booth;
  otherwise free ("Off the clock" after the booth closes).
- Preview any moment with `?now=2026-10-07T13:15` (Pacific wall time).

## Access (decide before sharing the URL)
V1 RLS lets the anon key read and write the single `main` row. Anyone who finds the key in `config.js` can edit the schedule.
Options, in order of effort:
1. Netlify site password (Netlify Pro feature) — fastest, no code change.
2. Supabase Auth with magic-link email for two allowlisted addresses; change policies to `to authenticated` and add
   `auth.email() in ('...','...')`. Add a small sign-in gate at the top of `index.html` before `storage.js` runs.
3. Keep the URL private and accept the risk for a one-week event.

## Conventions
- Times are 12-hour AM/PM strings (`"9:50 AM"`); `toMin()` / `fmt()` convert. Keep that format in seed data and imports.
- No em dashes anywhere in copy. US spelling.
- Copy is app voice, not conversational; no "I" or "send me".
- Keep the page self-contained apart from Google Fonts and the supabase-js UMD from jsdelivr.

## Open items
- Cost column in Talk tracks > Project menu, and meetup spots, still show [fill in].
- Session descriptions are blank until each day's agenda text is re-imported.
