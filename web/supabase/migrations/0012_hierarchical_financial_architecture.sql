do $migration$
begin
  create type public.congregation_level as enum (
    'national_hq',
    'state_hq',
    'sub_hq',
    'local_congregation'
  );
exception
  when duplicate_object then null;
end;
$migration$;

alter table public.congregations
  add column if not exists organization_level public.congregation_level not null default 'local_congregation';

update public.congregations
set organization_level = case
  when is_headquarters and parent_id is null then 'national_hq'::public.congregation_level
  when is_headquarters then 'state_hq'::public.congregation_level
  else 'local_congregation'::public.congregation_level
end;

do $migration$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'congregations_headquarters_level_check'
      and conrelid = 'public.congregations'::regclass
  ) then
    alter table public.congregations
      add constraint congregations_headquarters_level_check
      check (is_headquarters = (organization_level <> 'local_congregation'));
  end if;
end;
$migration$;

alter table public.entries
  add column if not exists is_internal_transfer boolean not null default false;

alter table public.expenses
  add column if not exists is_internal_transfer boolean not null default false;

create index if not exists congregations_parent_id_idx on public.congregations(parent_id);

create or replace function public.has_congregation_permission(
  target_congregation uuid,
  target_permission text
) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $function$
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

  if target_permission = 'hierarchy.financial.read' then
    return found and permission_override.hierarchy_financial_read;
  elsif target_permission = 'hierarchy.view' then
    return found and permission_override.hierarchy_view;
  end if;

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

create or replace function public.admin_replace_user_access(
  p_actor_id uuid,
  p_user_id uuid,
  p_assignments jsonb
) returns void
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  assignment jsonb;
  target_congregation uuid;
  target_role public.app_role;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null or p_user_id is null or coalesce(jsonb_typeof(p_assignments), '') <> 'array' then
    raise exception 'admin_assignments_invalid';
  end if;

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
    if not exists (select 1 from public.congregations where id = target_congregation) then
      raise exception 'admin_congregation_not_found';
    end if;

    insert into public.memberships (user_id, congregation_id, role)
    values (p_user_id, target_congregation, target_role);
    insert into public.membership_permission_overrides (
      user_id, congregation_id, financial_read, financial_write,
      financial_approve, closing_submit, audit_read, hierarchy_view,
      hierarchy_financial_read, updated_at
    ) values (
      p_user_id, target_congregation,
      coalesce((assignment -> 'permissions' ->> 'financial.read')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.write')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'financial.approve')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'closing.submit')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'audit.read')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'hierarchy.view')::boolean, false),
      coalesce((assignment -> 'permissions' ->> 'hierarchy.financial.read')::boolean, false),
      now()
    );
  end loop;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, null, 'updated', 'memberships', p_user_id,
          jsonb_build_object('assignments', p_assignments), 'platform_admin_access_update');
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
  p_is_headquarters boolean,
  p_parent_id uuid,
  p_organization_level public.congregation_level
) returns public.congregations
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  created_organization public.congregations;
  valid_parent boolean := false;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null then raise exception 'admin_actor_required'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'organization_name_required'; end if;
  if p_city is null or btrim(p_city) = '' then raise exception 'organization_city_required'; end if;
  if p_state is null or btrim(p_state) = '' then raise exception 'organization_state_required'; end if;
  if p_organization_type not in ('church', 'ong') then raise exception 'organization_type_invalid'; end if;
  if p_organization_level is null then raise exception 'organization_level_required'; end if;
  if p_is_headquarters is distinct from (p_organization_level <> 'local_congregation') then
    raise exception 'headquarters_level_mismatch';
  end if;
  if p_organization_level = 'national_hq' and p_parent_id is not null then
    raise exception 'national_headquarters_must_be_root';
  end if;
  if p_parent_id is not null then
    select exists (
      select 1 from public.congregations parent
      where parent.id = p_parent_id
        and case p_organization_level
          when 'state_hq' then parent.organization_level = 'national_hq'
          when 'sub_hq' then parent.organization_level in ('national_hq', 'state_hq')
          when 'local_congregation' then parent.organization_level in ('national_hq', 'state_hq', 'sub_hq')
          else false
        end
    ) into valid_parent;
    if not valid_parent then raise exception 'parent_organization_level_invalid'; end if;
  elsif p_organization_level not in ('national_hq', 'local_congregation') then
    raise exception 'parent_organization_required';
  end if;

  insert into public.congregations (
    name, city, state, organization_type, is_headquarters, parent_id, organization_level
  ) values (
    btrim(p_name), btrim(p_city), btrim(p_state), p_organization_type,
    p_is_headquarters, p_parent_id, p_organization_level
  ) returning * into created_organization;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, created_organization.id, 'created', 'congregations', created_organization.id, to_jsonb(created_organization), 'platform_admin_organization_create');
  return created_organization;
end;
$function$;

revoke all on function public.admin_create_congregation(uuid, text, text, text, text, boolean, uuid, public.congregation_level) from public, anon, authenticated;
grant execute on function public.admin_create_congregation(uuid, text, text, text, text, boolean, uuid, public.congregation_level) to service_role;

drop function if exists public.create_entry(uuid, date, bigint, text, text, text, text);
create function public.create_entry(
  p_congregation_id uuid,
  p_occurred_on date,
  p_amount_cents bigint,
  p_category text,
  p_origin text,
  p_payment_method text,
  p_purpose text default null,
  p_is_internal_transfer boolean default false
) returns public.entries
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  created_entry public.entries;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.entries (
    congregation_id, occurred_on, amount_cents, category, origin, payment_method,
    purpose, recorded_by, is_internal_transfer
  ) values (
    p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_origin,
    p_payment_method, p_purpose, auth.uid(), coalesce(p_is_internal_transfer, false)
  ) returning * into created_entry;
  return created_entry;
end;
$function$;

revoke all on function public.create_entry(uuid, date, bigint, text, text, text, text, boolean) from public, anon;
grant execute on function public.create_entry(uuid, date, bigint, text, text, text, text, boolean) to authenticated;

drop function if exists public.create_expense(uuid, date, bigint, text, text, text, text, text, text);
create function public.create_expense(
  p_congregation_id uuid,
  p_occurred_on date,
  p_amount_cents bigint,
  p_category text,
  p_description text,
  p_vendor text default null,
  p_payment_method text default 'other',
  p_purpose text default null,
  p_cost_center text default null,
  p_is_internal_transfer boolean default false
) returns public.expenses
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  created_expense public.expenses;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.expenses (
    congregation_id, occurred_on, amount_cents, category, description, vendor,
    payment_method, purpose, cost_center, recorded_by, is_internal_transfer
  ) values (
    p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_description,
    p_vendor, p_payment_method, p_purpose, p_cost_center, auth.uid(),
    coalesce(p_is_internal_transfer, false)
  ) returning * into created_expense;
  return created_expense;
end;
$function$;

revoke all on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text, boolean) to authenticated;

create or replace function public.get_hierarchical_financial_metrics(
  p_user_id uuid,
  p_unit_id uuid,
  p_mode text,
  p_start_date date,
  p_end_date date
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  metrics jsonb;
  can_read_hierarchy boolean := false;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'financial_metrics_user_mismatch' using errcode = '42501';
  end if;
  if p_mode is null or p_mode not in ('local', 'consolidated') then
    raise exception 'financial_metrics_mode_invalid';
  end if;
  if p_unit_id is null or p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'financial_metrics_period_invalid';
  end if;
  if not exists (select 1 from public.congregations where id = p_unit_id) then
    raise exception 'financial_metrics_unit_not_found';
  end if;

  if p_mode = 'local' then
    if not public.has_congregation_permission(p_unit_id, 'financial.read') then
      raise exception 'financial_read_not_allowed' using errcode = '42501';
    end if;
  else
    select coalesce(permission_override.hierarchy_financial_read, false)
      into can_read_hierarchy
    from public.membership_permission_overrides permission_override
    where permission_override.user_id = p_user_id
      and permission_override.congregation_id = p_unit_id;
    if not coalesce(can_read_hierarchy, false) then
      raise exception 'hierarchy_financial_read_not_allowed' using errcode = '42501';
    end if;
  end if;

  with recursive unit_tree(id, name, parent_id, organization_level, depth, visited) as (
    select congregation.id, congregation.name, null::uuid, congregation.organization_level, 0,
           array[congregation.id]::uuid[]
    from public.congregations congregation
    where congregation.id = p_unit_id
    union all
    select child.id, child.name, child.parent_id, child.organization_level, parent.depth + 1,
           parent.visited || child.id
    from public.congregations child
    join unit_tree parent on child.parent_id = parent.id
    where p_mode = 'consolidated'
      and not child.id = any(parent.visited)
  ),
  unit_totals as (
    select unit_tree.id as unit_id,
           unit_tree.name,
           unit_tree.parent_id,
           unit_tree.organization_level as level,
           unit_tree.depth,
           unit_tree.visited,
           coalesce(income.total, 0)::bigint as total_income,
           coalesce(expense.total, 0)::bigint as total_expense
    from unit_tree
    left join lateral (
      select sum(entry.amount_cents)::bigint as total
      from public.entries entry
      where entry.congregation_id = unit_tree.id
        and entry.occurred_on between p_start_date and p_end_date
        and (p_mode <> 'consolidated' or not entry.is_internal_transfer)
    ) income on true
    left join lateral (
      select sum(expense.amount_cents)::bigint as total
      from public.expenses expense
      where expense.congregation_id = unit_tree.id
        and expense.occurred_on between p_start_date and p_end_date
        and (p_mode <> 'consolidated' or not expense.is_internal_transfer)
    ) expense on true
  ),
  branch_totals as (
    select parent.unit_id,
           sum(descendant.total_income)::bigint as total_income,
           sum(descendant.total_expense)::bigint as total_expense
    from unit_totals parent
    join unit_totals descendant on parent.unit_id = any(descendant.visited)
    group by parent.unit_id
  )
  select jsonb_build_object(
    'total_income', coalesce(sum(unit_totals.total_income), 0),
    'total_expense', coalesce(sum(unit_totals.total_expense), 0),
    'balance', coalesce(sum(unit_totals.total_income - unit_totals.total_expense), 0),
    'units', coalesce(
      jsonb_agg(jsonb_build_object(
        'unit_id', unit_totals.unit_id,
        'name', unit_totals.name,
        'parent_id', unit_totals.parent_id,
        'level', unit_totals.level,
        'total_income', unit_totals.total_income,
        'total_expense', unit_totals.total_expense,
        'balance', unit_totals.total_income - unit_totals.total_expense,
        'subtree_total_income', branch_totals.total_income,
        'subtree_total_expense', branch_totals.total_expense,
        'subtree_balance', branch_totals.total_income - branch_totals.total_expense,
        'recent_movements', coalesce(movements.items, '[]'::jsonb)
      ) order by unit_totals.depth, unit_totals.name),
      '[]'::jsonb
    )
  ) into metrics
  from unit_totals
  join branch_totals on branch_totals.unit_id = unit_totals.unit_id
  left join lateral (
    select jsonb_agg(to_jsonb(recent) order by recent.occurred_on desc) as items
    from (
      select movement.id, movement.occurred_on::text as occurred_on, movement.kind,
             movement.label, movement.amount_cents
      from (
        select entry.id, entry.occurred_on, 'income'::text as kind,
               entry.category as label, entry.amount_cents
        from public.entries entry
        where entry.congregation_id = unit_totals.unit_id
          and entry.occurred_on between p_start_date and p_end_date
          and (p_mode <> 'consolidated' or not entry.is_internal_transfer)
        union all
        select expense.id, expense.occurred_on, 'expense'::text as kind,
               expense.description as label, expense.amount_cents
        from public.expenses expense
        where expense.congregation_id = unit_totals.unit_id
          and expense.occurred_on between p_start_date and p_end_date
          and (p_mode <> 'consolidated' or not expense.is_internal_transfer)
      ) movement
      order by movement.occurred_on desc, movement.id
      limit 10
    ) recent
  ) movements on true;

  return metrics;
end;
$function$;

revoke all on function public.get_hierarchical_financial_metrics(uuid, uuid, text, date, date) from public, anon;
grant execute on function public.get_hierarchical_financial_metrics(uuid, uuid, text, date, date) to authenticated;
