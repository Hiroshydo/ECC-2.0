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
  select * into period_row from public.physical_cash_periods p where p.id = p_cash_period_id for update;
  select * into register_row from public.physical_cash_registers r where r.id = period_row.cash_register_id;
  if period_row.id is null then raise exception 'cash_period_not_found'; end if;
  if period_row.status <> 'open' then raise exception 'cash_period_not_open'; end if;
  if not public.has_congregation_role(register_row.congregation_id, array['treasurer', 'congregation_admin', 'central_admin']::public.app_role[]) then raise exception 'cash_movement_not_allowed'; end if;
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'cash_amount_invalid'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'; end if;
  if p_idempotency_key is null then raise exception 'cash_idempotency_key_required'; end if;
  if public.period_is_closed(register_row.congregation_id, period_row.reference_period) then raise exception 'closed_period_requires_reopening'; end if;
  select * into movement
  from public.physical_cash_movements
  where created_by = actor and idempotency_key = p_idempotency_key;
  if movement.id is not null then return movement; end if;
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