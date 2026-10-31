alter table public.congregations
  add column if not exists leader_name text;
