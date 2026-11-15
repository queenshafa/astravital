-- Run AFTER your original schema. Adds the columns the forms need.
alter table astronauts
  add column if not exists astronaut_code text,
  add column if not exists gender text;

alter table health_baselines
  add column if not exists body_temperature numeric,
  add column if not exists respiration_rate numeric,
  add column if not exists systolic numeric,
  add column if not exists diastolic numeric;

alter table health_readings
  add column if not exists body_temperature numeric,
  add column if not exists respiration_rate numeric,
  add column if not exists systolic numeric,
  add column if not exists diastolic numeric;
