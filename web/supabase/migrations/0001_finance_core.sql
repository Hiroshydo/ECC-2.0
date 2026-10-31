create type public.app_role as enum ('central_admin', 'congregation_admin', 'treasurer', 'auditor', 'viewer');
create type public.transfer_status as enum ('planned', 'requested', 'approved', 'sent', 'confirmed', 'questioned', 'cancelled');
create type public.closing_status as enum ('open', 'submitted', 'approved', 'questioned', 'closed');

create table public.congregations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  congregation_id uuid not null references public.congregations(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, congregation_id)
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  occurred_on date not null,
  amount_cents bigint not null check (amount_cents > 0),
  category text not null,
  origin text not null,
  payment_method text not null,
  purpose text,
  receipt_id text,
  recorded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  occurred_on date not null,
  amount_cents bigint not null check (amount_cents > 0),
  category text not null,
  description text not null,
  vendor text,
  payment_method text not null,
  purpose text,
  cost_center text,
  receipt_id text,
  approved_by uuid references auth.users(id),
  recorded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.headquarters_transfers (
  id uuid primary key default gen_random_uuid(),
  origin_congregation_id uuid not null references public.congregations(id),
  destination_name text not null,
  reference_period date not null,
  amount_sent_cents bigint check (amount_sent_cents > 0),
  amount_received_cents bigint check (amount_received_cents >= 0),
  occurred_on date,
  status public.transfer_status not null default 'planned',
  reason text not null,
  requested_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  receipt_id text,
  created_at timestamptz not null default now()
);

create table public.monthly_closings (
  congregation_id uuid not null references public.congregations(id),
  reference_period date not null,
  opening_balance_cents bigint not null default 0,
  adjustments_cents bigint not null default 0,
  status public.closing_status not null default 'open',
  submitted_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  closed_at timestamptz,
  primary key (congregation_id, reference_period)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  congregation_id uuid references public.congregations(id),
  action text not null,
  entity text not null,
  entity_id uuid not null,
  occurred_at timestamptz not null default now(),
  before_data jsonb,
  after_data jsonb,
  reason text
);

create or replace function public.is_congregation_member(target_congregation uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and congregation_id = target_congregation
  );
$$;

alter table public.congregations enable row level security;
alter table public.memberships enable row level security;
alter table public.entries enable row level security;
alter table public.expenses enable row level security;
alter table public.headquarters_transfers enable row level security;
alter table public.monthly_closings enable row level security;
alter table public.audit_events enable row level security;

create policy "members can read their congregations" on public.congregations for select using (public.is_congregation_member(id));
create policy "members can read their entries" on public.entries for select using (public.is_congregation_member(congregation_id));
create policy "members can read their expenses" on public.expenses for select using (public.is_congregation_member(congregation_id));
create policy "members can read their transfers" on public.headquarters_transfers for select using (public.is_congregation_member(origin_congregation_id));
create policy "members can read their closings" on public.monthly_closings for select using (public.is_congregation_member(congregation_id));
create policy "members can read their audit events" on public.audit_events for select using (congregation_id is not null and public.is_congregation_member(congregation_id));

-- Inserts, updates and approvals must be added through server-side commands that
-- check role permissions and append an audit_events row in the same transaction.
