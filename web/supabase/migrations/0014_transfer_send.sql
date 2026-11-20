alter table public.headquarters_transfers
  add column if not exists amount_requested_cents bigint check (amount_requested_cents > 0),
  add column if not exists amount_approved_cents bigint check (amount_approved_cents > 0),
  add column if not exists approved_at timestamptz;

update public.headquarters_transfers
set amount_requested_cents = amount_sent_cents
where amount_requested_cents is null and amount_sent_cents is not null;

update public.headquarters_transfers transfer
set amount_approved_cents = transfer.amount_sent_cents,
    approved_at = coalesce(
      transfer.approved_at,
      (
        select event.occurred_at
        from public.audit_events event
        where event.entity = 'headquarters_transfers'
          and event.entity_id = transfer.id
          and event.action = 'approved'
        order by event.occurred_at desc
        limit 1
      ),
      transfer.created_at
    )
where transfer.status in ('approved', 'sent', 'confirmed', 'questioned')
  and transfer.amount_approved_cents is null
  and transfer.amount_sent_cents is not null;

update public.headquarters_transfers
set amount_sent_cents = null
where status in ('requested', 'approved');

create table if not exists public.headquarters_transfer_sends (
  transfer_id uuid primary key references public.headquarters_transfers(id) on delete restrict,
  occurred_on date not null,
  amount_sent_cents bigint not null check (amount_sent_cents > 0),
  method text not null check (method in ('pix', 'transfer', 'deposit', 'cash')),
  reference text,
  note text,
  sent_by uuid not null references auth.users(id),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  check (method <> 'cash' or nullif(btrim(reference), '') is not null),
  check (reference is null or length(reference) <= 200),
  check (note is null or length(note) <= 1000)
);

alter table public.headquarters_transfer_sends enable row level security;
revoke all on table public.headquarters_transfer_sends from public, anon, authenticated;
grant select on table public.headquarters_transfer_sends to authenticated;
create policy "members can read transfer send details"
  on public.headquarters_transfer_sends for select using (
    exists (
      select 1
      from public.headquarters_transfers transfer
      where transfer.id = transfer_id
        and public.has_congregation_permission(transfer.origin_congregation_id, 'financial.read')
    )
  );

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

  if target_permission = 'transfer.send' then
    return actor_role = 'treasurer';
  end if;

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

create or replace function public.request_transfer(
  p_origin_congregation_id uuid,
  p_destination_name text,
  p_reference_period date,
  p_amount_sent_cents bigint,
  p_reason text,
  p_occurred_on date default null
) returns public.headquarters_transfers
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  created_transfer public.headquarters_transfers;
  sender_count integer;
begin
  if not public.has_congregation_permission(p_origin_congregation_id, 'financial.write') then
    raise exception 'transfer_write_not_allowed';
  end if;
  select count(*) into sender_count
  from public.memberships
  where congregation_id = p_origin_congregation_id and role = 'treasurer';
  if sender_count < 2 then raise exception 'transfer_send_staffing_required'; end if;
  perform public.require_open_period(p_origin_congregation_id, p_reference_period);
  insert into public.headquarters_transfers (
    origin_congregation_id, destination_name, reference_period,
    amount_requested_cents, amount_sent_cents, occurred_on, status, reason, requested_by
  ) values (
    p_origin_congregation_id, p_destination_name, date_trunc('month', p_reference_period)::date,
    p_amount_sent_cents, null, null, 'requested', p_reason, auth.uid()
  ) returning * into created_transfer;
  return created_transfer;
end;
$function$;

create or replace function public.approve_transfer(p_transfer_id uuid)
returns public.headquarters_transfers
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  target public.headquarters_transfers;
  approved public.headquarters_transfers;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_permission(target.origin_congregation_id, 'financial.approve') then
    raise exception 'transfer_approval_not_allowed';
  end if;
  if target.requested_by = auth.uid() then raise exception 'transfer_self_approval_forbidden'; end if;
  if target.status <> 'requested' then raise exception 'transfer_not_requested'; end if;
  if target.amount_requested_cents is null then raise exception 'transfer_requested_amount_missing'; end if;

  update public.headquarters_transfers
  set status = 'approved',
      amount_approved_cents = target.amount_requested_cents,
      approved_by = auth.uid(),
      approved_at = now()
  where id = p_transfer_id
  returning * into approved;

  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'approved', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(approved), 'transfer_approval');
  return approved;
end;
$function$;

create or replace function public.mark_transfer_sent(
  p_transfer_id uuid,
  p_occurred_on date,
  p_amount_sent_cents bigint,
  p_method text,
  p_reference text,
  p_note text,
  p_idempotency_key uuid
) returns public.headquarters_transfers
language plpgsql security definer set search_path = public, pg_temp as $function$
declare
  target public.headquarters_transfers;
  existing_send public.headquarters_transfer_sends;
  send_record public.headquarters_transfer_sends;
  sent_transfer public.headquarters_transfers;
  send_reference text := nullif(btrim(p_reference), '');
  send_note text := nullif(btrim(p_note), '');
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if target.requested_by = auth.uid() then raise exception 'transfer_sender_requester_conflict'; end if;
  if target.approved_by = auth.uid() then raise exception 'transfer_sender_approver_conflict'; end if;
  if not public.has_congregation_permission(target.origin_congregation_id, 'transfer.send') then
    raise exception 'transfer_send_not_allowed';
  end if;
  if p_idempotency_key is null then raise exception 'transfer_send_idempotency_key_invalid'; end if;

  select * into existing_send
  from public.headquarters_transfer_sends
  where transfer_id = p_transfer_id;
  if existing_send.transfer_id is not null then
    if existing_send.idempotency_key = p_idempotency_key
      and existing_send.sent_by = auth.uid()
      and existing_send.occurred_on = p_occurred_on
      and existing_send.amount_sent_cents = p_amount_sent_cents
      and existing_send.method = p_method
      and existing_send.reference is not distinct from send_reference
      and existing_send.note is not distinct from send_note then
      return target;
    end if;
    raise exception 'transfer_already_sent';
  end if;

  if target.status <> 'approved' then raise exception 'transfer_not_approved'; end if;
  if p_amount_sent_cents is null or p_amount_sent_cents <= 0 then raise exception 'amount_must_be_positive_cents'; end if;
  if target.amount_approved_cents is null or p_amount_sent_cents <> target.amount_approved_cents then
    raise exception 'transfer_sent_amount_must_match_approved';
  end if;
  if p_method not in ('pix', 'transfer', 'deposit', 'cash') then raise exception 'transfer_send_method_invalid'; end if;
  if p_method = 'cash' and send_reference is null then raise exception 'transfer_send_reference_required'; end if;
  if length(coalesce(send_reference, '')) > 200 or length(coalesce(send_note, '')) > 1000 then
    raise exception 'transfer_send_details_too_long';
  end if;
  if p_occurred_on is null then raise exception 'transfer_send_date_required'; end if;
  if p_occurred_on > (now() at time zone 'America/Sao_Paulo')::date then raise exception 'transfer_send_date_in_future'; end if;
  if target.approved_at is null then raise exception 'transfer_approval_timestamp_missing'; end if;
  if p_occurred_on < (target.approved_at at time zone 'America/Sao_Paulo')::date then
    raise exception 'transfer_send_date_before_approval';
  end if;
  perform public.require_open_period(target.origin_congregation_id, p_occurred_on);

  insert into public.headquarters_transfer_sends (
    transfer_id, occurred_on, amount_sent_cents, method, reference, note, sent_by, idempotency_key
  ) values (
    target.id, p_occurred_on, p_amount_sent_cents, p_method, send_reference, send_note, auth.uid(), p_idempotency_key
  ) returning * into send_record;

  update public.headquarters_transfers
  set status = 'sent', amount_sent_cents = p_amount_sent_cents, occurred_on = p_occurred_on
  where id = p_transfer_id
  returning * into sent_transfer;

  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (
    auth.uid(),
    target.origin_congregation_id,
    'sent',
    'headquarters_transfers',
    target.id,
    to_jsonb(target),
    jsonb_build_object('transfer', to_jsonb(sent_transfer), 'send', to_jsonb(send_record)),
    'transfer_sent'
  );
  return sent_transfer;
end;
$function$;

revoke all on function public.request_transfer(uuid, text, date, bigint, text, date) from public;
revoke all on function public.approve_transfer(uuid) from public;
revoke all on function public.mark_transfer_sent(uuid, date, bigint, text, text, text, uuid) from public, anon;
grant execute on function public.request_transfer(uuid, text, date, bigint, text, date) to authenticated;
grant execute on function public.approve_transfer(uuid) to authenticated;
grant execute on function public.mark_transfer_sent(uuid, date, bigint, text, text, text, uuid) to authenticated;
