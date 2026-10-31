create type public.reopening_status as enum ('pending', 'approved', 'rejected');
create type public.correction_status as enum ('posted', 'reversed');
create type public.cash_movement_type as enum ('cash_in', 'cash_expense', 'withdrawal', 'deposit', 'physical_exit');
create type public.cash_period_status as enum ('open', 'closed');

create table public.period_reopening_requests (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  reference_period date not null,
  reason text not null check (btrim(reason) <> ''),
  status public.reopening_status not null default 'pending',
  requested_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (id, congregation_id, reference_period)
);

create unique index period_reopening_pending_idx
  on public.period_reopening_requests (congregation_id, reference_period)
  where status = 'pending';

create table public.financial_adjustments (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  reference_period date not null,
  entity_type text not null check (entity_type in ('entries', 'expenses')),
  entity_id uuid not null,
  amount_cents bigint not null check (amount_cents <> 0),
  reason text not null check (btrim(reason) <> ''),
  status public.correction_status not null default 'posted',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  idempotency_key uuid not null,
  unique (created_by, idempotency_key)
);

create index financial_adjustments_entity_idx
  on public.financial_adjustments (entity_type, entity_id);
create index financial_adjustments_period_idx
  on public.financial_adjustments (congregation_id, reference_period);

create table public.financial_reversals (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  reference_period date not null,
  entity_type text not null check (entity_type in ('entries', 'expenses')),
  entity_id uuid not null,
  amount_cents bigint not null check (amount_cents > 0),
  reason text not null check (btrim(reason) <> ''),
  status public.correction_status not null default 'posted',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  idempotency_key uuid not null,
  unique (created_by, idempotency_key),
  unique (entity_type, entity_id)
);

create index financial_reversals_period_idx
  on public.financial_reversals (congregation_id, reference_period);

create table public.physical_cash_registers (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  name text not null check (btrim(name) <> ''),
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (congregation_id, name)
);

create table public.physical_cash_periods (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.physical_cash_registers(id),
  reference_period date not null,
  opening_balance_cents bigint not null check (opening_balance_cents >= 0),
  status public.cash_period_status not null default 'open',
  counted_balance_cents bigint,
  counted_by uuid references auth.users(id),
  counted_at timestamptz,
  divergence_reason text,
  closed_by uuid references auth.users(id),
  closed_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (cash_register_id, reference_period),
  check (counted_balance_cents is null or counted_balance_cents >= 0),
  check ((counted_balance_cents is null and counted_by is null and counted_at is null) or
         (counted_balance_cents is not null and counted_by is not null and counted_at is not null))
);

create table public.physical_cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_period_id uuid not null references public.physical_cash_periods(id),
  movement_type public.cash_movement_type not null,
  amount_cents bigint not null check (amount_cents > 0),
  reason text not null check (btrim(reason) <> ''),
  source_entity_type text,
  source_entity_id uuid,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  idempotency_key uuid not null,
  unique (created_by, idempotency_key)
);

create index physical_cash_periods_reference_idx
  on public.physical_cash_periods (cash_register_id, reference_period);
create index physical_cash_movements_period_idx
  on public.physical_cash_movements (cash_period_id, created_at);

alter table public.period_reopening_requests enable row level security;
alter table public.financial_adjustments enable row level security;
alter table public.financial_reversals enable row level security;
alter table public.physical_cash_registers enable row level security;
alter table public.physical_cash_periods enable row level security;
alter table public.physical_cash_movements enable row level security;

create policy "members can read reopening requests" on public.period_reopening_requests
  for select using (public.is_congregation_member(congregation_id));
create policy "members can read adjustments" on public.financial_adjustments
  for select using (public.is_congregation_member(congregation_id));
create policy "members can read reversals" on public.financial_reversals
  for select using (public.is_congregation_member(congregation_id));
create policy "members can read cash registers" on public.physical_cash_registers
  for select using (public.is_congregation_member(congregation_id));
create policy "members can read cash periods" on public.physical_cash_periods
  for select using (
    exists (
      select 1
      from public.physical_cash_registers r
      where r.id = cash_register_id
        and public.is_congregation_member(r.congregation_id)
    )
  );
create policy "members can read cash movements" on public.physical_cash_movements
  for select using (
    exists (
      select 1
      from public.physical_cash_periods p
      join public.physical_cash_registers r on r.id = p.cash_register_id
      where p.id = cash_period_id
        and public.is_congregation_member(r.congregation_id)
    )
  );

create or replace view public.congregation_monthly_summary
with (security_invoker = true) as
with months as (
  select congregation_id, date_trunc('month', occurred_on)::date as reference_period from public.entries
  union select congregation_id, date_trunc('month', occurred_on)::date from public.expenses
  union select origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date from public.headquarters_transfers
  union select congregation_id, reference_period from public.financial_adjustments
  union select congregation_id, reference_period from public.financial_reversals
), entry_totals as (
  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) entries
  from public.entries group by congregation_id, date_trunc('month', occurred_on)::date
), expense_totals as (
  select congregation_id, date_trunc('month', occurred_on)::date reference_period, coalesce(sum(amount_cents), 0) expenses
  from public.expenses group by congregation_id, date_trunc('month', occurred_on)::date
), transfer_totals as (
  select origin_congregation_id congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date reference_period,
    coalesce(sum(amount_sent_cents) filter (where status <> 'cancelled'), 0) transfers
  from public.headquarters_transfers group by origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date
), adjustment_totals as (
  select congregation_id, reference_period, coalesce(sum(amount_cents), 0)::bigint adjustments
  from public.financial_adjustments where status = 'posted'
  group by congregation_id, reference_period
), reversal_totals as (
  select congregation_id, reference_period,
    coalesce(sum(case when entity_type = 'entries' then -amount_cents else amount_cents end), 0)::bigint reversals
  from public.financial_reversals where status = 'posted'
  group by congregation_id, reference_period
)
select m.congregation_id, m.reference_period,
  coalesce(c.opening_balance_cents, 0) opening_balance,
  coalesce(e.entries, 0) entries,
  coalesce(x.expenses, 0) expenses,
  coalesce(t.transfers, 0) transfers,
  coalesce(c.adjustments_cents, 0) + coalesce(a.adjustments, 0) adjustments,
  coalesce(c.opening_balance_cents, 0) + coalesce(e.entries, 0) - coalesce(x.expenses, 0) - coalesce(t.transfers, 0)
    + coalesce(a.adjustments, 0) + coalesce(r.reversals, 0) + coalesce(c.adjustments_cents, 0) closing_balance,
  c.status closing_status
from months m
left join public.monthly_closings c using (congregation_id, reference_period)
left join entry_totals e using (congregation_id, reference_period)
left join expense_totals x using (congregation_id, reference_period)
left join transfer_totals t using (congregation_id, reference_period)
left join adjustment_totals a using (congregation_id, reference_period)
left join reversal_totals r using (congregation_id, reference_period);

create or replace function public.require_authenticated()
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;
  return auth.uid();
end;
$$;

create or replace function public.request_period_reopening(
  p_congregation_id uuid,
  p_reference_period date,
  p_reason text
) returns public.period_reopening_requests
language plpgsql security definer set search_path = public as $$
declare
  actor uuid := public.require_authenticated();
  request_row public.period_reopening_requests;
begin
  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then
    raise exception 'reopening_request_not_allowed';
  end if;
  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'reopening_reason_required';
  end if;
  if not public.period_is_closed(p_congregation_id, p_reference_period) then
    raise exception 'period_not_closed';
  end if;
  insert into public.period_reopening_requests (congregation_id, reference_period, reason, requested_by)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, p_reason, actor)
  returning * into request_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'requested', 'period_reopening_requests', request_row.id, to_jsonb(request_row), p_reason);
  return request_row;
end;
$$;

create or replace function public.approve_period_reopening(
  p_request_id uuid
) returns public.period_reopening_requests
language plpgsql security definer set search_path = public as $$
declare
  actor uuid := public.require_authenticated();
  request_row public.period_reopening_requests;
  approved_row public.period_reopening_requests;
  before_closing public.monthly_closings;
  after_closing public.monthly_closings;
begin
  select * into request_row from public.period_reopening_requests where id = p_request_id for update;
  if request_row.id is null then raise exception 'reopening_request_not_found'; end if;
  if request_row.status <> 'pending' then raise exception 'reopening_request_not_pending'; end if;
  if request_row.requested_by = actor then raise exception 'reopening_self_approval_forbidden'; end if;
  if not public.has_congregation_role(request_row.congregation_id, array['central_admin']::public.app_role[]) then
    raise exception 'reopening_approval_not_allowed';
  end if;
  select * into before_closing from public.monthly_closings
  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period for update;
  if before_closing.status <> 'closed' then raise exception 'period_not_closed'; end if;
  update public.monthly_closings
  set status = 'open', closed_at = null, approved_by = actor
  where congregation_id = request_row.congregation_id and reference_period = request_row.reference_period
  returning * into after_closing;
  update public.period_reopening_requests
  set status = 'approved', approved_by = actor, approved_at = now()
  where id = p_request_id
  returning * into approved_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (actor, request_row.congregation_id, 'approved', 'period_reopening_requests', p_request_id,
    jsonb_build_object('request', to_jsonb(request_row), 'closing', to_jsonb(before_closing)),
    jsonb_build_object('request', to_jsonb(approved_row), 'closing', to_jsonb(after_closing)), request_row.reason);
  return approved_row;
end;
$$;

create or replace function public.create_financial_adjustment(
  p_congregation_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_amount_cents bigint,
  p_reason text,
  p_idempotency_key uuid
) returns public.financial_adjustments
language plpgsql security definer set search_path = public as $$
declare
  actor uuid := public.require_authenticated();
  source_congregation uuid;
  source_period date;
  adjustment public.financial_adjustments;
begin
  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then
    raise exception 'adjustment_not_allowed';
  end if;
  if p_amount_cents is null or p_amount_cents = 0 then raise exception 'adjustment_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'adjustment_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'adjustment_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on into source_congregation, source_period from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on into source_congregation, source_period from public.expenses where id = p_entity_id;
  else
    raise exception 'adjustment_entity_type_invalid';
  end if;
  if source_congregation is null then raise exception 'adjustment_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'adjustment_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_adjustments (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, p_amount_cents, p_reason, actor, p_idempotency_key)
  on conflict (created_by, idempotency_key) do nothing
  returning * into adjustment;
  if adjustment.id is null then
    select * into adjustment from public.financial_adjustments where created_by = actor and idempotency_key = p_idempotency_key;
    return adjustment;
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_adjustments', adjustment.id, to_jsonb(adjustment), p_reason);
  return adjustment;
end;
$$;

create or replace function public.create_financial_reversal(
  p_congregation_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_reason text,
  p_idempotency_key uuid
) returns public.financial_reversals
language plpgsql security definer set search_path = public as $$
declare
  actor uuid := public.require_authenticated();
  source_congregation uuid;
  source_period date;
  source_amount bigint;
  reversal public.financial_reversals;
begin
  if not public.has_congregation_role(p_congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then
    raise exception 'reversal_not_allowed';
  end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'reversal_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'reversal_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.expenses where id = p_entity_id;
  else
    raise exception 'reversal_entity_type_invalid';
  end if;
  if source_congregation is null then raise exception 'reversal_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'reversal_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_reversals (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, source_amount, p_reason, actor, p_idempotency_key)
  on conflict (entity_type, entity_id) do nothing
  returning * into reversal;
  if reversal.id is null then
    select * into reversal from public.financial_reversals where entity_type = p_entity_type and entity_id = p_entity_id;
    if reversal.created_by = actor and reversal.idempotency_key = p_idempotency_key then return reversal; end if;
    raise exception 'reversal_already_exists';
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_reversals', reversal.id, to_jsonb(reversal), p_reason);
  return reversal;
end;
$$;

create or replace function public.create_cash_register(
  p_congregation_id uuid,
  p_name text
) returns public.physical_cash_registers
language plpgsql security definer set search_path = public as $$
declare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers;
begin
  if not public.has_congregation_role(p_congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_register_not_allowed'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'cash_register_name_required'; end if;
  insert into public.physical_cash_registers (congregation_id, name, created_by) values (p_congregation_id, p_name, actor) returning * into register_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, p_congregation_id, 'created', 'physical_cash_registers', register_row.id, to_jsonb(register_row), 'cash_register_created');
  return register_row;
end;
$$;

create or replace function public.open_cash_period(
  p_cash_register_id uuid,
  p_reference_period date,
  p_opening_balance_cents bigint
) returns public.physical_cash_periods
language plpgsql security definer set search_path = public as $$
declare actor uuid := public.require_authenticated(); register_row public.physical_cash_registers; period_row public.physical_cash_periods;
begin
  select * into register_row from public.physical_cash_registers where id = p_cash_register_id;
  if register_row.id is null then raise exception 'cash_register_not_found'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_period_not_allowed'; end if;
  if p_opening_balance_cents is null or p_opening_balance_cents < 0 then raise exception 'cash_opening_amount_invalid'; end if;
  if public.period_is_closed(register_row.congregation_id, p_reference_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.physical_cash_periods (cash_register_id, reference_period, opening_balance_cents, created_by)
  values (p_cash_register_id, date_trunc('month', p_reference_period)::date, p_opening_balance_cents, actor)
  returning * into period_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'opened', 'physical_cash_periods', period_row.id, to_jsonb(period_row), 'cash_period_opened');
  return period_row;
end;
$$;

create or replace function public.record_cash_movement(
  p_cash_period_id uuid,
  p_movement_type public.cash_movement_type,
  p_amount_cents bigint,
  p_reason text,
  p_idempotency_key uuid
) returns public.physical_cash_movements
language plpgsql security definer set search_path = public as $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; movement public.physical_cash_movements; expected_balance bigint;
begin
  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;
  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;
  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)
  into expected_balance
  from public.physical_cash_movements
  where cash_period_id = p_cash_period_id;
  if p_movement_type <> 'cash_in' and expected_balance < p_amount_cents then
    raise exception 'cash_insufficient_balance';
  end if;
  insert into public.physical_cash_movements (cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)
  values (p_cash_period_id, p_movement_type, p_amount_cents, p_reason, actor, p_idempotency_key)
  on conflict (created_by, idempotency_key) do nothing returning * into movement;
  if movement.id is null then select * into movement from public.physical_cash_movements where created_by = actor and idempotency_key = p_idempotency_key; return movement; end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason) values (actor, register_row.congregation_id, 'created', 'physical_cash_movements', movement.id, to_jsonb(movement), p_reason);
  return movement;
end;
$$;

create or replace function public.count_cash(
  p_cash_period_id uuid,
  p_counted_balance_cents bigint,
  p_divergence_reason text default null
) returns public.physical_cash_periods
language plpgsql security definer set search_path = public as $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; updated_period public.physical_cash_periods; expected_balance bigint;
begin
  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_count_not_allowed'; end if;
  if p_counted_balance_cents is null or p_counted_balance_cents < 0 then raise exception 'cash_count_invalid'; end if;
  select period_row.opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)
  into expected_balance from public.physical_cash_movements where cash_period_id = p_cash_period_id;
  if p_counted_balance_cents <> expected_balance and (p_divergence_reason is null or btrim(p_divergence_reason) = '') then raise exception 'cash_divergence_reason_required'; end if;
  update public.physical_cash_periods set counted_balance_cents = p_counted_balance_cents, counted_by = actor, counted_at = now(), divergence_reason = p_divergence_reason where id = p_cash_period_id returning * into updated_period;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'counted', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(updated_period), coalesce(p_divergence_reason, 'cash_counted'));
  return updated_period;
end;
$$;

create or replace function public.close_cash_period(
  p_cash_period_id uuid
) returns public.physical_cash_periods
language plpgsql security definer set search_path = public as $$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; closed_period public.physical_cash_periods;
begin
  select p into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select r into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_close_not_allowed'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if period_row.counted_balance_cents is null then raise exception 'cash_count_required'; end if;
  update public.physical_cash_periods set status = 'closed', closed_by = actor, closed_at = now() where id = p_cash_period_id returning * into closed_period;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason) values (actor, register_row.congregation_id, 'closed', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(closed_period), 'cash_period_closed');
  return closed_period;
end;
$$;

revoke all on function public.require_authenticated() from public;
revoke all on function public.request_period_reopening(uuid, date, text) from public;
revoke all on function public.approve_period_reopening(uuid) from public;
revoke all on function public.create_financial_adjustment(uuid, text, uuid, bigint, text, uuid) from public;
revoke all on function public.create_financial_reversal(uuid, text, uuid, text, uuid) from public;
revoke all on function public.create_cash_register(uuid, text) from public;
revoke all on function public.open_cash_period(uuid, date, bigint) from public;
revoke all on function public.record_cash_movement(uuid, public.cash_movement_type, bigint, text, uuid) from public;
revoke all on function public.count_cash(uuid, bigint, text) from public;
revoke all on function public.close_cash_period(uuid) from public;

grant execute on function public.request_period_reopening(uuid, date, text) to authenticated;
grant execute on function public.approve_period_reopening(uuid) to authenticated;
grant execute on function public.create_financial_adjustment(uuid, text, uuid, bigint, text, uuid) to authenticated;
grant execute on function public.create_financial_reversal(uuid, text, uuid, text, uuid) to authenticated;
grant execute on function public.create_cash_register(uuid, text) to authenticated;
grant execute on function public.open_cash_period(uuid, date, bigint) to authenticated;
grant execute on function public.record_cash_movement(uuid, public.cash_movement_type, bigint, text, uuid) to authenticated;
grant execute on function public.count_cash(uuid, bigint, text) to authenticated;
grant execute on function public.close_cash_period(uuid) to authenticated;
