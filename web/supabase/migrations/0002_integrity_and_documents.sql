create type public.document_entity as enum ('entry', 'expense', 'transfer', 'correction');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations(id),
  entity_type public.document_entity not null,
  entity_id uuid not null,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index documents_entity_idx on public.documents(entity_type, entity_id);

create or replace function public.has_congregation_role(target_congregation uuid, allowed_roles public.app_role[])
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid()
      and congregation_id = target_congregation
      and role = any(allowed_roles)
  );
$$;

create or replace function public.period_is_closed(target_congregation uuid, target_period date)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.monthly_closings
    where congregation_id = target_congregation
      and reference_period = date_trunc('month', target_period)::date
      and status = 'closed'
  );
$$;

create or replace function public.prevent_closed_period_changes()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_congregation uuid;
  target_period date;
begin
  if tg_table_name = 'headquarters_transfers' then
    target_congregation := coalesce(new.origin_congregation_id, old.origin_congregation_id);
    target_period := coalesce(new.occurred_on, new.reference_period, old.occurred_on, old.reference_period);
  else
    target_congregation := coalesce(new.congregation_id, old.congregation_id);
    target_period := coalesce(new.occurred_on, old.occurred_on);
  end if;
  if public.period_is_closed(target_congregation, target_period) then
    raise exception 'closed_period_requires_correction_or_reopening';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger entries_closed_period_guard before insert or update or delete on public.entries
for each row execute function public.prevent_closed_period_changes();
create trigger expenses_closed_period_guard before insert or update or delete on public.expenses
for each row execute function public.prevent_closed_period_changes();
create trigger transfers_closed_period_guard before insert or update or delete on public.headquarters_transfers
for each row execute function public.prevent_closed_period_changes();

create or replace function public.audit_financial_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_actor uuid;
  target_congregation uuid;
  target_entity text;
begin
  if tg_table_name = 'headquarters_transfers' then
    target_actor := new.requested_by;
    target_congregation := new.origin_congregation_id;
  else
    target_actor := new.recorded_by;
    target_congregation := new.congregation_id;
  end if;
  target_entity := tg_table_name;
  insert into public.audit_events(actor_id, congregation_id, action, entity, entity_id, after_data, reason)
  values (target_actor, target_congregation, 'created', target_entity, new.id, to_jsonb(new), 'financial_record_created');
  return new;
end;
$$;

create trigger entries_audit_insert after insert on public.entries
for each row execute function public.audit_financial_insert();
create trigger expenses_audit_insert after insert on public.expenses
for each row execute function public.audit_financial_insert();
create trigger transfers_audit_insert after insert on public.headquarters_transfers
for each row execute function public.audit_financial_insert();

create or replace view public.congregation_monthly_summary
with (security_invoker = true) as
with months as (
  select congregation_id, date_trunc('month', occurred_on)::date as reference_period from public.entries
  union select congregation_id, date_trunc('month', occurred_on)::date from public.expenses
  union select origin_congregation_id, date_trunc('month', coalesce(occurred_on, reference_period))::date from public.headquarters_transfers
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
)
select m.congregation_id, m.reference_period,
  coalesce(c.opening_balance_cents, 0) opening_balance,
  coalesce(e.entries, 0) entries,
  coalesce(x.expenses, 0) expenses,
  coalesce(t.transfers, 0) transfers,
  coalesce(c.adjustments_cents, 0) adjustments,
  coalesce(c.opening_balance_cents, 0) + coalesce(e.entries, 0) - coalesce(x.expenses, 0) - coalesce(t.transfers, 0) + coalesce(c.adjustments_cents, 0) closing_balance,
  c.status closing_status
from months m
left join public.monthly_closings c using (congregation_id, reference_period)
left join entry_totals e using (congregation_id, reference_period)
left join expense_totals x using (congregation_id, reference_period)
left join transfer_totals t using (congregation_id, reference_period);

alter table public.documents enable row level security;
create policy "users can read their memberships" on public.memberships for select using (user_id = auth.uid());
create policy "members can read linked documents" on public.documents for select using (public.is_congregation_member(congregation_id));
create policy "finance roles can upload documents" on public.documents for insert with check (
  uploaded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])
);

create policy "finance roles can create entries" on public.entries for insert with check (
  recorded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])
);
create policy "finance roles can create expenses" on public.expenses for insert with check (
  recorded_by = auth.uid() and public.has_congregation_role(congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])
);
create policy "finance roles can create transfers" on public.headquarters_transfers for insert with check (
  requested_by = auth.uid() and public.has_congregation_role(origin_congregation_id, array['central_admin', 'congregation_admin', 'treasurer']::public.app_role[])
);

-- Financial rows have no UPDATE or DELETE policy. Corrections, estornos and
-- authorized reopening must be implemented as audited server-side commands.
