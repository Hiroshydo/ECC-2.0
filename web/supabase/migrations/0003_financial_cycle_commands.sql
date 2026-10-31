create type public.expense_status as enum ('pending', 'approved', 'rejected', 'reversed');
alter table public.expenses add column status public.expense_status not null default 'pending';
alter table public.expenses add column approved_at timestamptz;
alter table public.monthly_closings add column id uuid default gen_random_uuid();
alter table public.monthly_closings alter column id set not null;
create unique index monthly_closings_id_idx on public.monthly_closings(id);

create or replace function public.require_open_period(target_congregation uuid, target_period date)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.period_is_closed(target_congregation, target_period) then
    raise exception 'closed_period_requires_correction_or_reopening';
  end if;
end;
$$;

create or replace function public.create_entry(
  p_congregation_id uuid,
  p_occurred_on date,
  p_amount_cents bigint,
  p_category text,
  p_origin text,
  p_payment_method text,
  p_purpose text default null
) returns public.entries
language plpgsql security definer set search_path = public as $$
declare created_entry public.entries;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
  values (p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_origin, p_payment_method, p_purpose, auth.uid())
  returning * into created_entry;
  return created_entry;
end;
$$;

create or replace function public.create_expense(
  p_congregation_id uuid,
  p_occurred_on date,
  p_amount_cents bigint,
  p_category text,
  p_description text,
  p_vendor text default null,
  p_payment_method text default 'other',
  p_purpose text default null,
  p_cost_center text default null
) returns public.expenses
language plpgsql security definer set search_path = public as $$
declare created_expense public.expenses;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'financial_write_not_allowed';
  end if;
  perform public.require_open_period(p_congregation_id, p_occurred_on);
  insert into public.expenses (congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, recorded_by)
  values (p_congregation_id, p_occurred_on, p_amount_cents, p_category, p_description, p_vendor, p_payment_method, p_purpose, p_cost_center, auth.uid())
  returning * into created_expense;
  return created_expense;
end;
$$;

create or replace function public.approve_expense(p_expense_id uuid)
returns public.expenses language plpgsql security definer set search_path = public as $$
declare target public.expenses; approved public.expenses;
begin
  select * into target from public.expenses where id = p_expense_id for update;
  if target.id is null then raise exception 'expense_not_found'; end if;
  if not public.has_congregation_role(target.congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then
    raise exception 'financial_approval_not_allowed';
  end if;
  if target.status <> 'pending' then raise exception 'expense_not_pending'; end if;
  update public.expenses set status = 'approved', approved_by = auth.uid(), approved_at = now() where id = p_expense_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.congregation_id, 'approved', 'expenses', target.id, to_jsonb(target), to_jsonb(approved), 'expense_approval');
  return approved;
end;
$$;

create or replace function public.request_transfer(
  p_origin_congregation_id uuid,
  p_destination_name text,
  p_reference_period date,
  p_amount_sent_cents bigint,
  p_reason text,
  p_occurred_on date default null
) returns public.headquarters_transfers
language plpgsql security definer set search_path = public as $$
declare created_transfer public.headquarters_transfers;
begin
  if not public.has_congregation_role(p_origin_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[]) then
    raise exception 'transfer_write_not_allowed';
  end if;
  perform public.require_open_period(p_origin_congregation_id, coalesce(p_occurred_on, p_reference_period));
  insert into public.headquarters_transfers (origin_congregation_id, destination_name, reference_period, amount_sent_cents, occurred_on, status, reason, requested_by)
  values (p_origin_congregation_id, p_destination_name, date_trunc('month', p_reference_period)::date, p_amount_sent_cents, p_occurred_on, 'requested', p_reason, auth.uid())
  returning * into created_transfer;
  return created_transfer;
end;
$$;

create or replace function public.approve_transfer(p_transfer_id uuid)
returns public.headquarters_transfers language plpgsql security definer set search_path = public as $$
declare target public.headquarters_transfers; approved public.headquarters_transfers;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_role(target.origin_congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then
    raise exception 'transfer_approval_not_allowed';
  end if;
  if target.status <> 'requested' then raise exception 'transfer_not_requested'; end if;
  update public.headquarters_transfers set status = 'approved', approved_by = auth.uid() where id = p_transfer_id returning * into approved;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'approved', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(approved), 'transfer_approval');
  return approved;
end;
$$;

create or replace function public.confirm_transfer(p_transfer_id uuid, p_amount_received_cents bigint)
returns public.headquarters_transfers language plpgsql security definer set search_path = public as $$
declare target public.headquarters_transfers; confirmed public.headquarters_transfers; next_status public.transfer_status;
begin
  select * into target from public.headquarters_transfers where id = p_transfer_id for update;
  if target.id is null then raise exception 'transfer_not_found'; end if;
  if not public.has_congregation_role(target.origin_congregation_id, array['central_admin']::public.app_role[]) then
    raise exception 'headquarters_confirmation_not_allowed';
  end if;
  if target.status not in ('approved', 'sent') then raise exception 'transfer_not_ready_for_confirmation'; end if;
  next_status := case when target.amount_sent_cents = p_amount_received_cents then 'confirmed' else 'questioned' end;
  update public.headquarters_transfers set amount_received_cents = p_amount_received_cents, status = next_status where id = p_transfer_id returning * into confirmed;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
  values (auth.uid(), target.origin_congregation_id, 'confirmed', 'headquarters_transfers', target.id, to_jsonb(target), to_jsonb(confirmed), case when next_status = 'confirmed' then 'transfer_reconciled' else 'transfer_divergence' end);
  return confirmed;
end;
$$;

create or replace function public.close_monthly_period(p_congregation_id uuid, p_reference_period date)
returns public.monthly_closings language plpgsql security definer set search_path = public as $$
declare closing public.monthly_closings;
begin
  if not public.has_congregation_role(p_congregation_id, array['central_admin', 'congregation_admin']::public.app_role[]) then
    raise exception 'closing_not_allowed';
  end if;
  insert into public.monthly_closings (congregation_id, reference_period, status, submitted_by, approved_by, closed_at)
  values (p_congregation_id, date_trunc('month', p_reference_period)::date, 'closed', auth.uid(), auth.uid(), now())
  on conflict (congregation_id, reference_period) do update set status = 'closed', approved_by = auth.uid(), closed_at = now()
  returning * into closing;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (auth.uid(), p_congregation_id, 'closed', 'monthly_closings', closing.id, to_jsonb(closing), 'monthly_period_closed');
  return closing;
end;
$$;

revoke all on function public.create_entry(uuid, date, bigint, text, text, text, text) from public;
revoke all on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text) from public;
revoke all on function public.approve_expense(uuid) from public;
revoke all on function public.request_transfer(uuid, text, date, bigint, text, date) from public;
revoke all on function public.approve_transfer(uuid) from public;
revoke all on function public.confirm_transfer(uuid, bigint) from public;
revoke all on function public.close_monthly_period(uuid, date) from public;
grant execute on function public.create_entry(uuid, date, bigint, text, text, text, text) to authenticated;
grant execute on function public.create_expense(uuid, date, bigint, text, text, text, text, text, text) to authenticated;
grant execute on function public.approve_expense(uuid) to authenticated;
grant execute on function public.request_transfer(uuid, text, date, bigint, text, date) to authenticated;
grant execute on function public.approve_transfer(uuid) to authenticated;
grant execute on function public.confirm_transfer(uuid, bigint) to authenticated;
grant execute on function public.close_monthly_period(uuid, date) to authenticated;
