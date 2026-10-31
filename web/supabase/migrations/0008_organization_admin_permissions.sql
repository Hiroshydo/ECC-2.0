alter table public.congregations
  add column if not exists state text,
  add column if not exists organization_type text not null default 'church',
  add column if not exists is_headquarters boolean not null default false;

do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'congregations_organization_type_check'
      and conrelid = 'public.congregations'::regclass
  ) then
    alter table public.congregations
      add constraint congregations_organization_type_check
      check (organization_type in ('church', 'ong'));
  end if;
end;
$migration$;

create table if not exists public.membership_permission_overrides (
  user_id uuid not null,
  congregation_id uuid not null,
  financial_read boolean not null default true,
  financial_write boolean not null default false,
  financial_approve boolean not null default false,
  closing_submit boolean not null default false,
  audit_read boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, congregation_id),
  foreign key (user_id, congregation_id)
    references public.memberships(user_id, congregation_id) on delete cascade
);

alter table public.membership_permission_overrides enable row level security;
create policy "users can read their permission overrides"
  on public.membership_permission_overrides for select using (user_id = auth.uid());

create or replace function public.has_congregation_permission(
  target_congregation uuid,
  target_permission text
) returns boolean
language plpgsql security definer set search_path = public as $function$
declare
  actor_role public.app_role;
  permission_override public.membership_permission_overrides;
begin
  select role into actor_role
  from public.memberships
  where user_id = auth.uid() and congregation_id = target_congregation;

  if actor_role is null then return false; end if;

  select * into permission_override
  from public.membership_permission_overrides
  where user_id = auth.uid() and congregation_id = target_congregation;

  if found then
    if target_permission <> 'financial.read' and not permission_override.financial_read then return false; end if;
    return case target_permission
      when 'financial.read' then permission_override.financial_read
      when 'financial.write' then permission_override.financial_write
      when 'financial.approve' then permission_override.financial_approve
      when 'closing.submit' then permission_override.closing_submit
      when 'audit.read' then permission_override.audit_read
      else false
    end;
  end if;

  return case target_permission
    when 'financial.read' then true
    when 'financial.write' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'financial.approve' then actor_role in ('central_admin', 'congregation_admin')
    when 'closing.submit' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'audit.read' then actor_role in ('central_admin', 'congregation_admin', 'auditor')
    else false
  end;
end;
$function$;

revoke all on function public.has_congregation_permission(uuid, text) from public;
grant execute on function public.has_congregation_permission(uuid, text) to authenticated;

create or replace function public.is_congregation_member(target_congregation uuid)
returns boolean language sql security definer set search_path = public as $function$
  select public.has_congregation_permission(target_congregation, 'financial.read');
$function$;

create or replace function public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[])
returns boolean language plpgsql security definer set search_path = public as $function$
declare
  actor_role public.app_role;
  has_override boolean;
begin
  select role into actor_role
  from public.memberships
  where user_id = auth.uid() and congregation_id = target_congregation;
  if actor_role is null then return false; end if;

  select exists (
    select 1 from public.membership_permission_overrides
    where user_id = auth.uid() and congregation_id = target_congregation
  ) into has_override;

  if has_override and 'treasurer' = any(allowed_roles) then
    return public.has_congregation_permission(target_congregation, 'financial.write');
  end if;

  return actor_role = any(allowed_roles);
end;
$function$;

drop policy if exists "finance roles can upload documents" on public.documents;
create policy "finance roles can upload documents" on public.documents for insert with check (
  uploaded_by = auth.uid() and public.has_congregation_permission(congregation_id, 'financial.write')
);

drop policy if exists "finance roles can create entries" on public.entries;
create policy "finance roles can create entries" on public.entries for insert with check (
  recorded_by = auth.uid() and public.has_congregation_permission(congregation_id, 'financial.write')
);

drop policy if exists "finance roles can create expenses" on public.expenses;
create policy "finance roles can create expenses" on public.expenses for insert with check (
  recorded_by = auth.uid() and public.has_congregation_permission(congregation_id, 'financial.write')
);

drop policy if exists "finance roles can create transfers" on public.headquarters_transfers;
create policy "finance roles can create transfers" on public.headquarters_transfers for insert with check (
  requested_by = auth.uid() and public.has_congregation_permission(origin_congregation_id, 'financial.write')
);

create or replace function public.approve_expense(p_expense_id uuid)
returns public.expenses language plpgsql security definer set search_path = public as $function$
declare target public.expenses; approved public.expenses;
begin
  select * into target from public.expenses where id = p_expense_id for update;
  if target.id is null then raise exception 'expense_not_found'; end if;
  if not public.has_congregation_permission(target.congregation_id, 'financial.approve') then raise exception 'financial_approval_not_allowed'; end if;
  if target.status <> 'pending' then raise exception 'expense_not_pending'; end if;
  update public.expenses set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = p_expense_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.congregation_id, 'approved', 'expenses', target.id, to_jsonb(target), to_jsonb(approved), 'expense_approval');
  return approved;
end;
$function$;

create or replace function public.approve_transfer(p_transfer_id uuid)
returns public.headquarters_transfers language plpgsql security definer set search_path = public as $function$
declare target public.headquarters_transfers; approved public.headquarters_transfers;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_permission(target.origin_congregation_id, 'financial.approve') then raise exception 'transfer_approval_not_allowed'; end if;
  if target.status <> 'requested' then raise exception 'transfer_not_requested'; end if;
  update public.headquarters_transfers set status = 'approved', approved_by = auth.uid() where id = p_transfer_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'approved', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(approved), 'transfer_approval');
  return approved;
end;
$function$;

create or replace function public.close_monthly_period(p_congregation_id uuid, p_reference_period date)
returns public.monthly_closings language plpgsql security definer set search_path = public as $function$
declare closing public.monthly_closings;
begin
  if not public.has_congregation_permission(p_congregation_id, 'closing.submit') then raise exception 'closing_not_allowed'; end if;
  insert into public.monthly_closings (congregation_id, reference_period, status, submitted_by, approved_by, closed_at)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, 'closed', auth.uid(), auth.uid(), now())
  on conflict (congregation_id, reference_period) do update set status = 'closed', approved_by = auth.uid(), closed_at = now()
  returning * into closing;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (auth.uid(), p_congregation_id, 'closed', 'monthly_closings', closing.id, to_jsonb(closing), 'monthly_period_closed');
  return closing;
end;
$function$;

create or replace function public.request_period_reopening(
  p_congregation_id uuid, p_reference_period date, p_reason text
) returns public.period_reopening_requests
language plpgsql security definer set search_path = public as $function$
declare actor uuid := public.require_authenticated(); request_row public.period_reopening_requests;
begin
  if not public.has_congregation_permission(p_congregation_id, 'closing.submit') then raise exception 'reopening_request_not_allowed'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'reopening_reason_required'; end if;
  if not public.period_is_closed(p_congregation_id, p_reference_period) then raise exception 'period_not_closed'; end if;
  insert into public.period_reopening_requests (congregation_id, reference_period, reason, requested_by)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, p_reason, actor) returning * into request_row;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'requested', 'period_reopening_requests', request_row.id, to_jsonb(request_row), p_reason);
  return request_row;
end;
$function$;

create or replace function public.create_financial_adjustment(
  p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_amount_cents bigint, p_reason text, p_idempotency_key uuid
) returns public.financial_adjustments
language plpgsql security definer set search_path = public as $function$
declare actor uuid := public.require_authenticated(); source_congregation uuid; source_period date; adjustment public.financial_adjustments;
begin
  if not public.has_congregation_permission(p_congregation_id, 'financial.approve') then raise exception 'adjustment_not_allowed'; end if;
  if p_amount_cents is null or p_amount_cents = 0 then raise exception 'adjustment_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'adjustment_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'adjustment_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on into source_congregation, source_period from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on into source_congregation, source_period from public.expenses where id = p_entity_id;
  else raise exception 'adjustment_entity_type_invalid'; end if;
  if source_congregation is null then raise exception 'adjustment_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'adjustment_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_adjustments (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, p_amount_cents, p_reason, actor, p_idempotency_key)
  on conflict (created_by, idempotency_key) do nothing returning * into adjustment;
  if adjustment.id is null then
    select * into adjustment from public.financial_adjustments where created_by = actor and idempotency_key = p_idempotency_key;
    return adjustment;
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_adjustments', adjustment.id, to_jsonb(adjustment), p_reason);
  return adjustment;
end;
$function$;

create or replace function public.create_financial_reversal(
  p_congregation_id uuid, p_entity_type text, p_entity_id uuid, p_reason text, p_idempotency_key uuid
) returns public.financial_reversals
language plpgsql security definer set search_path = public as $function$
declare actor uuid := public.require_authenticated(); source_congregation uuid; source_period date; source_amount bigint; reversal public.financial_reversals;
begin
  if not public.has_congregation_permission(p_congregation_id, 'financial.approve') then raise exception 'reversal_not_allowed'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'reversal_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'reversal_idempotency_key_required'; end if;
  if p_entity_type = 'entries' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.entries where id = p_entity_id;
  elsif p_entity_type = 'expenses' then
    select congregation_id, occurred_on, amount_cents into source_congregation, source_period, source_amount from public.expenses where id = p_entity_id;
  else raise exception 'reversal_entity_type_invalid'; end if;
  if source_congregation is null then raise exception 'reversal_entity_not_found'; end if;
  if source_congregation <> p_congregation_id then raise exception 'reversal_cross_congregation_forbidden'; end if;
  if public.period_is_closed(source_congregation, source_period) then raise exception 'closed_period_requires_reopening'; end if;
  insert into public.financial_reversals (congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
  values (p_congregation_id, date_trunc('month', source_period)::date, p_entity_type, p_entity_id, source_amount, p_reason, actor, p_idempotency_key)
  on conflict (entity_type, entity_id) do nothing returning * into reversal;
  if reversal.id is null then
    select * into reversal from public.financial_reversals where entity_type = p_entity_type and entity_id = p_entity_id;
    if reversal.created_by = actor and reversal.idempotency_key = p_idempotency_key then return reversal; end if;
    raise exception 'reversal_already_exists';
  end if;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (actor, p_congregation_id, 'posted', 'financial_reversals', reversal.id, to_jsonb(reversal), p_reason);
  return reversal;
end;
$function$;

create or replace function public.close_cash_period(p_cash_period_id uuid)
returns public.physical_cash_periods language plpgsql security definer set search_path = public as $function$
declare actor uuid := public.require_authenticated(); period_row public.physical_cash_periods; register_row public.physical_cash_registers; closed_period public.physical_cash_periods;
begin
  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if not public.has_congregation_permission(register_row.congregation_id, 'closing.submit') then raise exception 'cash_close_not_allowed'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if period_row.counted_balance_cents is null then raise exception 'cash_count_required'; end if;
  update public.physical_cash_periods set status = 'closed', closed_by = actor, closed_at = now() where id = p_cash_period_id returning * into closed_period;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (actor, register_row.congregation_id, 'closed', 'physical_cash_periods', period_row.id, to_jsonb(period_row), to_jsonb(closed_period), 'cash_period_closed');
  return closed_period;
end;
$function$;

create or replace function public.admin_replace_user_access(p_actor_id uuid, p_user_id uuid, p_assignments jsonb)
returns void language plpgsql security definer set search_path = public as $function$
declare assignment jsonb; target_congregation uuid; target_role public.app_role;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null or p_user_id is null or coalesce(jsonb_typeof(p_assignments), '') <> 'array' then raise exception 'admin_assignments_invalid'; end if;
  delete from public.memberships where user_id = p_user_id;
  for assignment in select * from jsonb_array_elements(p_assignments) loop
    target_congregation := (assignment ->> 'congregationId')::uuid;
    target_role := (assignment ->> 'role')::public.app_role;
    if not coalesce((assignment -> 'permissions' ->> 'financial.read')::boolean, false)
      and (
        coalesce((assignment -> 'permissions' ->> 'financial.write')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'financial.approve')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'closing.submit')::boolean, false)
        or coalesce((assignment -> 'permissions' ->> 'audit.read')::boolean, false)
      ) then raise exception 'financial_read_required_for_other_permissions'; end if;
    if not exists (select 1 from public.congregations where id = target_congregation) then raise exception 'admin_congregation_not_found'; end if;
    insert into public.memberships (user_id, congregation_id, role) values (p_user_id, target_congregation, target_role);
    insert into public.membership_permission_overrides (
      user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, updated_at
    ) values (
      p_user_id, target_congregation,
      coalesce((assignment -> 'permissions' ->> 'financial.read')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.write')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.approve')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'closing.submit')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'audit.read')::boolean, false), now()
    );
  end loop;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, null, 'updated', 'memberships', p_user_id, jsonb_build_object('assignments', p_assignments), 'platform_admin_access_update');
end;
$function$;

revoke all on function public.admin_replace_user_access(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_replace_user_access(uuid, uuid, jsonb) to service_role;

create or replace function public.admin_create_congregation(
  p_actor_id uuid,
  p_name text,
  p_city text,
  p_state text,
  p_organization_type text,
  p_is_headquarters boolean
) returns public.congregations
language plpgsql security definer set search_path = public as $function$
declare created_organization public.congregations;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null then raise exception 'admin_actor_required'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'organization_name_required'; end if;
  if p_city is null or btrim(p_city) = '' then raise exception 'organization_city_required'; end if;
  if p_state is null or btrim(p_state) = '' then raise exception 'organization_state_required'; end if;
  if p_organization_type not in ('church', 'ong') then raise exception 'organization_type_invalid'; end if;
  insert into public.congregations (name, city, state, organization_type, is_headquarters)
  values (btrim(p_name), btrim(p_city), btrim(p_state), p_organization_type, coalesce(p_is_headquarters, false))
  returning * into created_organization;
  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, created_organization.id, 'created', 'congregations', created_organization.id, to_jsonb(created_organization), 'platform_admin_organization_create');
  return created_organization;
end;
$function$;

revoke all on function public.admin_create_congregation(uuid, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.admin_create_congregation(uuid, text, text, text, text, boolean) to service_role;
drop policy if exists "members can read their audit events" on public.audit_events;
create policy "members can read their audit events" on public.audit_events for select using (
  congregation_id is not null and public.has_congregation_permission(congregation_id, 'audit.read')
);

create or replace view public.congregation_monthly_entry_categories
with (security_invoker = true) as
select congregation_id,
       date_trunc('month', occurred_on)::date as reference_period,
       category,
       sum(amount_cents)::bigint as amount_cents
from public.entries
group by congregation_id, date_trunc('month', occurred_on)::date, category;

grant select on public.congregation_monthly_entry_categories to authenticated;