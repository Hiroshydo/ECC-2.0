alter table public.congregations
  add column if not exists license_status text
    check (license_status is null or license_status in ('active', 'grace_period', 'blocked')),
  add column if not exists license_expires_at timestamptz,
  add column if not exists license_cycle_days integer
    check (license_cycle_days is null or license_cycle_days > 0),
  add column if not exists max_operators integer
    check (max_operators is null or max_operators >= 0);

update public.congregations congregation
   set license_status = 'active',
       license_expires_at = license.expires_at,
       license_cycle_days = 30,
       max_operators = license.seats_total
  from public.khatam_licenses license
 where license.congregation_id = congregation.id
   and congregation.license_expires_at is null;
