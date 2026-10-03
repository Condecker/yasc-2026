-- YASC guide: one shared schedule document, edited by the booth team, synced in real time.
create table if not exists public.schedules (
  id          text primary key,
  data        jsonb not null default '{"sessions":[],"picks":{}}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Realtime: let clients subscribe to row changes.
alter publication supabase_realtime add table public.schedules;

-- Row-level security. V1 ships with an anon-key policy limited to the single row "main".
-- This means anyone with the site URL can read and edit the schedule. See CLAUDE.md "Access" for the
-- upgrade path (Supabase Auth magic links, or a Netlify password) before sharing the URL widely.
alter table public.schedules enable row level security;

drop policy if exists "anon read main" on public.schedules;
create policy "anon read main" on public.schedules
  for select to anon using (id = 'main');

drop policy if exists "anon upsert main" on public.schedules;
create policy "anon upsert main" on public.schedules
  for insert to anon with check (id = 'main');

drop policy if exists "anon update main" on public.schedules;
create policy "anon update main" on public.schedules
  for update to anon using (id = 'main') with check (id = 'main');

-- Seed the row so the first visitor's upsert has something to update.
insert into public.schedules (id) values ('main') on conflict (id) do nothing;
