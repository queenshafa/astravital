-- Auth: every astronaut belongs to the logged-in user; Row Level Security enforces it.
alter table astronauts
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- astronaut_code only has to be unique per user
alter table astronauts drop constraint if exists astronauts_astronaut_code_key;
create unique index if not exists astronauts_user_code_idx on astronauts (user_id, astronaut_code);
create index if not exists astronauts_user_idx on astronauts (user_id);

alter table astronauts       enable row level security;
alter table health_baselines enable row level security;
alter table health_readings  enable row level security;
alter table risk_analyses    enable row level security;
alter table space_hazards    enable row level security;

-- remove the old demo policies (open access) if you ran an earlier version
drop policy if exists "demo anon all" on astronauts;
drop policy if exists "demo anon all" on health_baselines;
drop policy if exists "demo anon all" on health_readings;
drop policy if exists "demo anon all" on risk_analyses;
drop policy if exists "demo anon read" on space_hazards;

drop policy if exists "own astronauts" on astronauts;
create policy "own astronauts" on astronauts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own baselines" on health_baselines;
create policy "own baselines" on health_baselines for all to authenticated
  using (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())));

drop policy if exists "own readings" on health_readings;
create policy "own readings" on health_readings for all to authenticated
  using (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())));

drop policy if exists "own risk analyses" on risk_analyses;
create policy "own risk analyses" on risk_analyses for all to authenticated
  using (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from astronauts a where a.id = astronaut_id and a.user_id = (select auth.uid())));

-- Space hazards are shared context: any logged-in user can read, and the /api/hazards route (running as the user) can insert.
-- For stricter control, insert with a server-only service role key instead and drop the insert policy.
drop policy if exists "hazards read" on space_hazards;
create policy "hazards read" on space_hazards for select to authenticated using (true);
drop policy if exists "hazards insert" on space_hazards;
create policy "hazards insert" on space_hazards for insert to authenticated with check (true);
