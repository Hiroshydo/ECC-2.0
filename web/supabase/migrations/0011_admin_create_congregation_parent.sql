drop function if exists public.admin_create_congregation(uuid, text, text, text, text, boolean);

create function public.admin_create_congregation(
  p_actor_id uuid,
  p_name text,
  p_city text,
  p_state text,
  p_organization_type text,
  p_is_headquarters boolean,
  p_parent_id uuid default null
) returns public.congregations
language plpgsql security definer set search_path = public as $function$
declare
  created_organization public.congregations;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'admin_service_role_required'; end if;
  if p_actor_id is null then raise exception 'admin_actor_required'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'organization_name_required'; end if;
  if p_city is null or btrim(p_city) = '' then raise exception 'organization_city_required'; end if;
  if p_state is null or btrim(p_state) = '' then raise exception 'organization_state_required'; end if;
  if p_organization_type not in ('church', 'ong') then raise exception 'organization_type_invalid'; end if;
  if coalesce(p_is_headquarters, false) and p_parent_id is not null then
    raise exception 'headquarters_cannot_have_parent';
  end if;
  if p_parent_id is not null and not exists (
    select 1 from public.congregations
    where id = p_parent_id
      and is_headquarters
      and organization_type = p_organization_type
  ) then
    raise exception 'parent_headquarters_invalid';
  end if;

  insert into public.congregations (name, city, state, organization_type, is_headquarters, parent_id)
  values (btrim(p_name), btrim(p_city), btrim(p_state), p_organization_type, coalesce(p_is_headquarters, false), p_parent_id)
  returning * into created_organization;

  insert into public.audit_events (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (p_actor_id, created_organization.id, 'created', 'congregations', created_organization.id, to_jsonb(created_organization), 'platform_admin_organization_create');
  return created_organization;
end;
$function$;

revoke all on function public.admin_create_congregation(uuid, text, text, text, text, boolean, uuid) from public, anon, authenticated;
grant execute on function public.admin_create_congregation(uuid, text, text, text, text, boolean, uuid) to service_role;
