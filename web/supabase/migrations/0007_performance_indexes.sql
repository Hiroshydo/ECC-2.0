create index entries_congregation_occurred_created_idx
  on public.entries (congregation_id, occurred_on desc, created_at desc);

create index expenses_congregation_occurred_created_idx
  on public.expenses (congregation_id, occurred_on desc, created_at desc);

create index transfers_origin_reference_created_idx
  on public.headquarters_transfers (origin_congregation_id, reference_period desc, created_at desc);

create index audit_events_congregation_occurred_idx
  on public.audit_events (congregation_id, occurred_at desc);

create index entries_missing_receipt_idx
  on public.entries (congregation_id, occurred_on)
  where receipt_id is null;

create index expenses_missing_receipt_idx
  on public.expenses (congregation_id, occurred_on)
  where receipt_id is null;

create index transfers_missing_receipt_idx
  on public.headquarters_transfers (origin_congregation_id, reference_period)
  where receipt_id is null;

create index transfers_sent_idx
  on public.headquarters_transfers (origin_congregation_id, status)
  where status = 'sent';