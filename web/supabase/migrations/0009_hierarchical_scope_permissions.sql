alter table public.congregations
  add column if not exists parent_id uuid references public.congregations(id);

alter table public.membership_permission_overrides
  add column if not exists hierarchy_view boolean not null default false,
  add column if not exists hierarchy_financial_read boolean not null default false;

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
    if target_permission <> 'financial.read' and not permission_override.financial_read then
      return case target_permission
        when 'hierarchy.view' then permission_override.hierarchy_view
        when 'hierarchy.financial.read' then permission_override.hierarchy_financial_read and permission_override.financial_read
        else false
      end;
    end if;

    return case target_permission
      when 'financial.read' then permission_override.financial_read
      when 'financial.write' then permission_override.financial_write
      when 'financial.approve' then permission_override.financial_approve
      when 'closing.submit' then permission_override.closing_submit
      when 'audit.read' then permission_override.audit_read
      when 'hierarchy.view' then permission_override.hierarchy_view
      when 'hierarchy.financial.read' then permission_override.hierarchy_financial_read and permission_override.financial_read
      else false
    end;
  end if;

  return case target_permission
    when 'financial.read' then true
    when 'financial.write' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'financial.approve' then actor_role in ('central_admin', 'congregation_admin')
    when 'closing.submit' then actor_role in ('central_admin', 'congregation_admin', 'treasurer')
    when 'audit.read' then actor_role in ('central_admin', 'congregation_admin', 'auditor')
    when 'hierarchy.view' then false
    when 'hierarchy.financial.read' then false
    else false
  end;
end;
$function$;

create or replace function public.is_congregation_member(target_congregation uuid)
returns boolean language sql security definer set search_path = public as $function$
  select public.has_congregation_permission(target_congregation, 'financial.read');
$function$;
