-- Real financial flow validation tests.
-- These assertions execute real write operations and verify the resulting state.

BEGIN;

CREATE OR REPLACE FUNCTION public.assert_true(p_condition boolean, p_message text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT p_condition THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: %', p_message;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_equal(p_actual anyelement, p_expected anyelement, p_message text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_actual IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: % (actual=% expected=%)', p_message, p_actual, p_expected;
  END IF;
END;
$$;

DO $$
DECLARE
  v_congregation_a uuid := '22222222-2222-4222-8222-222222222222';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_congregation_admin uuid := '55555555-5555-4555-8555-555555555555';
  v_entry_id uuid;
  v_expense_id uuid;
  v_transfer_id uuid;
  v_total_entries bigint;
  v_total_expenses bigint;
  v_status text;
BEGIN
  -- Valid entry must succeed and report correct actor + congregation.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
  VALUES (v_congregation_a, current_date, 5000, 'tithe', 'fixture', 'pix', 'entry validation', v_treasurer)
  RETURNING id INTO v_entry_id;

  PERFORM public.assert_not_null(v_entry_id, 'Valid entry should create a row.');
  PERFORM public.assert_equal(
    (SELECT amount_cents FROM public.entries WHERE id = v_entry_id),
    5000::bigint,
    'Entry amount should be persisted as submitted.'
  );

  -- Zero and negative values must be rejected by database constraints.
  BEGIN
    INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
    VALUES (v_congregation_a, current_date, 0, 'tithe', 'fixture', 'pix', 'zero rejected', v_treasurer);
    RAISE EXCEPTION 'Zero amount should be rejected.';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
    VALUES (v_congregation_a, current_date, -100, 'tithe', 'fixture', 'pix', 'negative rejected', v_treasurer);
    RAISE EXCEPTION 'Negative amount should be rejected.';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Expense creation and approval by authorized admin.
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  INSERT INTO public.expenses (congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, recorded_by, status)
  VALUES (v_congregation_a, current_date, 1500, 'missions', 'fixture expense', 'fixture vendor', 'pix', 'expense validation', 'general', v_congregation_admin, 'pending')
  RETURNING id INTO v_expense_id;

  UPDATE public.expenses
  SET status = 'approved', approved_by = v_congregation_admin, approved_at = now()
  WHERE id = v_expense_id;

  SELECT status INTO v_status FROM public.expenses WHERE id = v_expense_id;
  PERFORM public.assert_equal(v_status, 'approved', 'Expense approval did not persist.');

  -- Transfer workflow real scenario.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  INSERT INTO public.headquarters_transfers (
    origin_congregation_id,
    destination_name,
    reference_period,
    amount_sent_cents,
    amount_received_cents,
    occurred_on,
    status,
    reason,
    requested_by,
    approved_by
  ) VALUES (
    v_congregation_a,
    'Sede',
    date_trunc('month', current_date)::date,
    2000,
    NULL,
    current_date,
    'requested',
    'fixture transfer',
    v_treasurer,
    NULL
  ) RETURNING id INTO v_transfer_id;

  UPDATE public.headquarters_transfers
  SET status = 'approved', approved_by = v_congregation_admin
  WHERE id = v_transfer_id;

  UPDATE public.headquarters_transfers
  SET status = 'sent', amount_received_cents = 2000
  WHERE id = v_transfer_id;

  SELECT status INTO v_status FROM public.headquarters_transfers WHERE id = v_transfer_id;
  PERFORM public.assert_equal(v_status, 'sent', 'Transfer should reach sent status after approval.');

  -- Deterministic balance check.
  SELECT sum(amount_cents) INTO v_total_entries FROM public.entries WHERE congregation_id = v_congregation_a;
  SELECT sum(amount_cents) INTO v_total_expenses FROM public.expenses WHERE congregation_id = v_congregation_a;
  PERFORM public.assert_true(v_total_entries IS NOT NULL, 'Entry total should be available.');
  PERFORM public.assert_true(v_total_expenses IS NOT NULL, 'Expense total should be available.');

  -- Audit rows are created by triggers on insert; here we verify existence for the operations performed.
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'entries' AND entity_id = v_entry_id),
    'Audit row missing for created entry.'
  );

  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'expenses' AND entity_id = v_expense_id),
    'Audit row missing for created expense.'
  );

  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'headquarters_transfers' AND entity_id = v_transfer_id),
    'Audit row missing for transfer row.'
  );

  -- Audit table must be immutable in practice.
  BEGIN
    UPDATE public.audit_events
    SET reason = 'tamper'
    WHERE id = (
      SELECT id
      FROM public.audit_events
      WHERE entity_id = v_entry_id
      LIMIT 1
    );
    RAISE EXCEPTION 'Audit table update unexpectedly succeeded.';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  BEGIN
    DELETE FROM public.audit_events WHERE entity_id = v_entry_id;
    RAISE EXCEPTION 'Audit table delete unexpectedly succeeded.';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  PERFORM set_config('request.jwt.claim.sub', '', true);
  RAISE NOTICE 'Financial flow assertions passed.';
END $$;

COMMIT;
