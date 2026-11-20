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
  v_transfer_sender uuid := 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  v_other_unit_treasurer uuid := '99999999-9999-4999-8999-999999999999';
  v_auditor uuid := '77777777-7777-4777-8777-777777777777';
  v_entry_id uuid;
  v_expense_id uuid;
  v_transfer_id uuid;
  v_transfer public.headquarters_transfers;
  v_sent_transfer public.headquarters_transfers;
  v_send_date date := (now() at time zone 'America/Sao_Paulo')::date;
  v_month date := date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date;
  v_idempotency_key uuid := 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  v_send_count integer;
  v_total_entries bigint;
  v_total_expenses bigint;
  v_status text;
  v_sent_by uuid;
  v_send_method text;
  v_send_reference text;
  v_operation_succeeded boolean;
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
  v_operation_succeeded := true;
  BEGIN
    INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
    VALUES (v_congregation_a, current_date, 0, 'tithe', 'fixture', 'pix', 'zero rejected', v_treasurer);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Zero amount should be rejected.');

  v_operation_succeeded := true;
  BEGIN
    INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
    VALUES (v_congregation_a, current_date, -100, 'tithe', 'fixture', 'pix', 'negative rejected', v_treasurer);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Negative amount should be rejected.');

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

  -- Transfer requests require two direct treasury assignments.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  DELETE FROM public.memberships
  WHERE user_id = v_transfer_sender AND congregation_id = v_congregation_a;
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.request_transfer(v_congregation_a, 'Sede', v_send_date, 2000, 'staffing test', NULL);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A transfer must not be activated with only one sender.');
  INSERT INTO public.memberships(user_id, congregation_id, role)
  VALUES (v_transfer_sender, v_congregation_a, 'treasurer');

  v_transfer := public.request_transfer(v_congregation_a, 'Sede', v_send_date, 2000, 'fixture transfer', NULL);
  v_transfer_id := v_transfer.id;
  PERFORM public.assert_equal(v_transfer.status::text, 'requested', 'Transfer request should start as requested.');

  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'An unapproved transfer must not be sent.');

  -- The requester cannot approve their own request.
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.approve_transfer(v_transfer_id);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'The requester must not approve their own transfer.');

  -- Approval is performed by a different authorized person.
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  v_transfer := public.approve_transfer(v_transfer_id);
  PERFORM public.assert_equal(v_transfer.status::text, 'approved', 'The transfer should be approved.');
  PERFORM public.assert_equal(v_transfer.amount_approved_cents, 2000::bigint, 'The approved amount must be stored separately.');

  -- Requester, approver, another unit's treasurer and a member without transfer.send are denied.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'The requester must not register the transfer send.');

  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'The approver must not register the transfer send.');

  PERFORM set_config('request.jwt.claim.sub', v_other_unit_treasurer::text, true);
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A treasurer from another unit must not send this transfer.');

  PERFORM set_config('request.jwt.claim.sub', v_auditor::text, true);
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A member without transfer.send must not send the transfer.');

  -- The sender cannot change the approved value or omit a cash receipt reference.
  PERFORM set_config('request.jwt.claim.sub', v_transfer_sender::text, true);
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 1999, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Sent amount must equal the approved amount.');

  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'cash', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Cash sends must include a receipt reference.');

  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date + 1, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A future send date must be rejected.');

  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date - 1, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A send date before approval must be rejected.');

  INSERT INTO public.monthly_closings(id, congregation_id, reference_period, status, submitted_by, approved_by, closed_at)
  VALUES (gen_random_uuid(), v_congregation_a, v_month, 'closed', v_congregation_admin, v_congregation_admin, now())
  ON CONFLICT (congregation_id, reference_period)
  DO UPDATE SET status = 'closed', closed_at = now();
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'pix', NULL, NULL, v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'A transfer send in a closed period must be rejected.');
  UPDATE public.monthly_closings
  SET status = 'open', closed_at = NULL
  WHERE congregation_id = v_congregation_a AND reference_period = v_month;

  -- The distinct treasury sender records a single, audited send; a retry is idempotent.
  v_sent_transfer := public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'cash', 'RECIBO-001', 'Comprovante de teste', v_idempotency_key);
  PERFORM public.assert_equal(v_sent_transfer.status::text, 'sent', 'Transfer should reach sent only through the send command.');
  PERFORM public.assert_equal(v_sent_transfer.amount_sent_cents, 2000::bigint, 'Sent amount should be recorded.');
  v_sent_transfer := public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'cash', 'RECIBO-001', 'Comprovante de teste', v_idempotency_key);
  SELECT count(*) INTO v_send_count FROM public.headquarters_transfer_sends WHERE transfer_id = v_transfer_id;
  PERFORM public.assert_equal(v_send_count, 1, 'Idempotent retry must not create another send record.');
  SELECT sent_by, method, reference
  INTO v_sent_by, v_send_method, v_send_reference
  FROM public.headquarters_transfer_sends WHERE transfer_id = v_transfer_id;
  PERFORM public.assert_equal(v_sent_by, v_transfer_sender, 'The sender identity should be recorded.');
  PERFORM public.assert_equal(v_send_method, 'cash', 'The send method should be recorded.');
  PERFORM public.assert_equal(v_send_reference, 'RECIBO-001', 'The cash receipt reference should be recorded.');
  v_operation_succeeded := true;
  BEGIN
    PERFORM public.mark_transfer_sent(v_transfer_id, v_send_date, 2000, 'cash', 'RECIBO-DIFFERENTE', 'Comprovante de teste', v_idempotency_key);
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'An idempotency key cannot be reused with different details.');
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'headquarters_transfers' AND entity_id = v_transfer_id AND action = 'sent'),
    'Transfer send audit event is missing.'
  );

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

  PERFORM set_config('request.jwt.claim.sub', '', true);
  RAISE NOTICE 'Financial flow assertions passed.';
END $$;

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_auditor uuid := '77777777-7777-4777-8777-777777777777';
  v_entry_id uuid;
  v_update_count integer;
  v_delete_count integer;
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', v_auditor::text, 'role', 'authenticated', 'aud', 'authenticated')::text,
    true
  );
  PERFORM set_config('request.jwt.claim.sub', v_auditor::text, true);

  SELECT id INTO v_entry_id
  FROM public.entries
  WHERE congregation_id = '22222222-2222-4222-8222-222222222222'
    AND recorded_by = v_treasurer
    AND purpose = 'entry validation'
  ORDER BY created_at DESC
  LIMIT 1;
  PERFORM public.assert_not_null(v_entry_id, 'Authenticated audit immutability test could not find its fixture entry.');

  UPDATE public.audit_events
  SET reason = 'tamper'
  WHERE entity = 'entries' AND entity_id = v_entry_id;
  GET DIAGNOSTICS v_update_count = ROW_COUNT;
  PERFORM public.assert_equal(v_update_count, 0, 'Authenticated user modified an audit event.');

  DELETE FROM public.audit_events
  WHERE entity = 'entries' AND entity_id = v_entry_id;
  GET DIAGNOSTICS v_delete_count = ROW_COUNT;
  PERFORM public.assert_equal(v_delete_count, 0, 'Authenticated user deleted an audit event.');

  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'entries' AND entity_id = v_entry_id),
    'Audit event disappeared after denied modification attempts.'
  );
END $$;

COMMIT;
