-- OPTIONAL demo data. Sign up in the app FIRST: this attaches the demo astronaut to the first registered user.
insert into astronauts (user_id, astronaut_code, name, age, gender, mission)
select u.id, 'AST-0426', 'Demo Astronaut', 34, 'male', 'Orbitalis MVP'
from (select id from auth.users order by created_at limit 1) u
where not exists (select 1 from astronauts where astronaut_code = 'AST-0426' and user_id = u.id);

insert into health_baselines (astronaut_id, heart_rate, hrv, spo2, sleep_duration, activity_level, body_temperature, respiration_rate, systolic, diastolic)
select a.id, 75, 60, 97, 7, 60, 36.6, 16, 120, 80
from astronauts a where a.astronaut_code = 'AST-0426' and a.user_id = (select id from auth.users order by created_at limit 1)
on conflict (astronaut_id) do nothing;

-- 30 days of readings (every 2 h) that slowly drift away from baseline. Run once.
insert into health_readings (astronaut_id, heart_rate, hrv, spo2, sleep_duration, activity_level, body_temperature, respiration_rate, systolic, diastolic, recorded_at)
select a.id,
  round((75 + 4*sin(g.n::float8/6) + random()*4 + power(g.n::float8/360, 2)*9)::numeric, 1),
  round((60 - power(g.n::float8/360, 2)*14 + random()*6 - 3)::numeric, 1),
  round((97 - (g.n::float8/360)*1.6 + random()*0.8 - 0.4)::numeric, 1),
  round((7 - (g.n::float8/360)*1.4 + random()*0.8 - 0.4)::numeric, 1),
  round((60 - (g.n::float8/360)*20 + random()*8 - 4)::numeric, 1),
  round((36.6 + (g.n::float8/360)*0.3 + random()*0.2 - 0.1)::numeric, 1),
  round((16 + random()*2 - 1)::numeric, 1),
  118 + (random()*8)::int, 78 + (random()*6)::int,
  now() - ((360 - g.n) * interval '2 hours')
from astronauts a, generate_series(0, 359) as g(n)
where a.astronaut_code = 'AST-0426' and a.user_id = (select id from auth.users order by created_at limit 1);
