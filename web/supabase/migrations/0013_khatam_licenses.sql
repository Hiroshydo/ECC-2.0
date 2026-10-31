create table if not exists public.khatam_licenses (
  congregation_id uuid primary key references public.congregations(id) on delete cascade,
  seats_total integer not null check (seats_total >= 0),
  expires_at timestamptz not null
);

alter table public.khatam_licenses enable row level security;
