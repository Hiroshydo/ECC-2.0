-- Real assertions for period reopening, adjustments, reversals and physical cash.
-- This script runs as authenticated and uses only the new domain commands.

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

CREATE OR REPLACE FUNCTION public.assert_not_null(p_value anyelement, p_message text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_value IS NULL THEN
    RAISE EXCEPTION 'ASSERTION_FAILED: %', p_message;
  END IF;
END;
$$;

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_headquarters uuid := '11111111-1111-4111-8111-111111111111';
  v_congregation_a uuid := '22222222-2222-4222-8222-222222222222';
  v_central_admin uuid := '44444444-4444-4444-8444-444444444444';
  v_headquarters_admin uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_congregation_admin uuid := '55555555-5555-4555-8555-555555555555';
  v_period date := date_trunc('month', current_date)::date;
  v_entry_id uuid;
  v_expense_id uuid;
  v_reopening_id uuid;
  v_adjustment_id uuid;
  v_reversal_id uuid;
  v_cash_register_id uuid;
  v_cash_period_id uuid;
  v_cash_movement_id uuid;
  v_status text;
  v_count integer;
  v_before_adjustment bigint;
  v_after_adjustment bigint;
  v_operation_succeeded boolean;
BEGIN
  -- Reopening: central admin closes, congregation administrator requests,
  -- and a different central administrator approves.
  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  PERFORM public.close_monthly_period(v_headquarters, v_period);

  PERFORM set_config('request.jwt.claim.sub', v_headquarters_admin::text, true);
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.approve_period_reopening('00000000-0000-4000-8000-000000000000'::uuid);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Unknown reopening request unexpectedly succeeded.');

  v_operation_succeeded := false;
  BEGIN
    PERFORM public.request_period_reopening(v_headquarters, v_period, '');
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Reopening without a reason unexpectedly succeeded.');

  SELECT id INTO v_reopening_id
  FROM public.request_period_reopening(v_headquarters, v_period, 'Correção da prestação de contas da Sede');
  PERFORM public.assert_not_null(v_reopening_id, 'Authorized reopening request was not created.');

  v_operation_succeeded := false;
  BEGIN
    PERFORM public.approve_period_reopening(v_reopening_id);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Requester was allowed to approve its own reopening.');

  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  PERFORM public.approve_period_reopening(v_reopening_id);
  SELECT status::text INTO v_status FROM public.monthly_closings
  WHERE congregation_id = v_headquarters AND reference_period = v_period;
  PERFORM public.assert_equal(v_status, 'open', 'Approved reopening did not return the period to open.');
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'period_reopening_requests' AND entity_id = v_reopening_id AND action = 'approved'),
    'Reopening approval did not create an audit event.'
  );

  v_operation_succeeded := false;
  BEGIN
    PERFORM public.request_period_reopening(v_headquarters, v_period, 'Duplicate reopening');
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Duplicate reopening request unexpectedly succeeded.');

  -- Entry and adjustment: original remains unchanged and the formal adjustment
  -- changes only the derived balance.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  SELECT id INTO v_entry_id FROM public.create_entry(v_congregation_a, current_date, 50000, 'tithe', 'cash', 'cash', 'adjustment fixture');
  PERFORM public.assert_not_null(v_entry_id, 'Adjustment source entry was not created.');

  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  SELECT closing_balance INTO v_before_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  SELECT id INTO v_adjustment_id FROM public.create_financial_adjustment(
    v_congregation_a, 'entries', v_entry_id, 5000, 'Correção de valor registrado', '10000000-0000-4000-8000-000000000001'::uuid
  );
  PERFORM public.assert_not_null(v_adjustment_id, 'Formal adjustment was not created.');
  SELECT closing_balance INTO v_after_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  PERFORM public.assert_equal(v_after_adjustment, v_before_adjustment + 5000, 'Adjustment did not affect the derived balance deterministically.');
  PERFORM public.assert_equal((SELECT amount_cents FROM public.entries WHERE id = v_entry_id), 50000::bigint, 'Adjustment changed the original entry.');
  SELECT count(*) INTO v_count FROM public.financial_adjustments WHERE idempotency_key = '10000000-0000-4000-8000-000000000001'::uuid;
  PERFORM public.assert_equal(v_count, 1, 'Adjustment idempotency created duplicate rows.');
  PERFORM public.create_financial_adjustment(
    v_congregation_a, 'entries', v_entry_id, 5000, 'Retry da correção', '10000000-0000-4000-8000-000000000001'::uuid
  );
  SELECT count(*) INTO v_count FROM public.financial_adjustments WHERE idempotency_key = '10000000-0000-4000-8000-000000000001'::uuid;
  PERFORM public.assert_equal(v_count, 1, 'Repeated adjustment command created a second row.');
  SELECT closing_balance INTO v_before_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  PERFORM public.create_financial_adjustment(
    v_congregation_a, 'entries', v_entry_id, -5000, 'Correção negativa de valor registrado', '10000000-0000-4000-8000-000000000002'::uuid
  );
  SELECT closing_balance INTO v_after_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  PERFORM public.assert_equal(v_after_adjustment, v_before_adjustment - 5000, 'Negative adjustment did not reduce the derived balance by 5000.');
  PERFORM public.assert_equal((SELECT amount_cents FROM public.entries WHERE id = v_entry_id), 50000::bigint, 'Negative adjustment changed the original entry.');
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'financial_adjustments' AND entity_id = v_adjustment_id),
    'Adjustment did not create an audit event.'
  );

  v_operation_succeeded := false;
  BEGIN
    PERFORM public.create_financial_adjustment(v_congregation_a, 'entries', v_entry_id, 0, 'invalid', '10000000-0000-4000-8000-000000000003'::uuid);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Zero adjustment unexpectedly succeeded.');

  -- Integral reversal preserves the expense and applies the opposite balance effect.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  SELECT id INTO v_expense_id FROM public.create_expense(v_congregation_a, current_date, 30000, 'supplies', 'reversal fixture', 'fixture', 'cash', 'reversal', 'general');
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  PERFORM public.approve_expense(v_expense_id);
  SELECT closing_balance INTO v_before_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  SELECT id INTO v_reversal_id FROM public.create_financial_reversal(
    v_congregation_a, 'expenses', v_expense_id, 'Pagamento cancelado', '20000000-0000-4000-8000-000000000001'::uuid
  );
  PERFORM public.assert_not_null(v_reversal_id, 'Integral reversal was not created.');
  SELECT closing_balance INTO v_after_adjustment
  FROM public.congregation_monthly_summary
  WHERE congregation_id = v_congregation_a AND reference_period = v_period;
  PERFORM public.assert_equal(v_after_adjustment, v_before_adjustment + 30000, 'Expense reversal did not increase the derived balance by the original amount.');
  PERFORM public.assert_true(EXISTS (SELECT 1 FROM public.expenses WHERE id = v_expense_id), 'Reversal deleted the original expense.');
  PERFORM public.assert_equal((SELECT amount_cents FROM public.expenses WHERE id = v_expense_id), 30000::bigint, 'Reversal changed the original expense amount.');
  PERFORM public.create_financial_reversal(
    v_congregation_a, 'expenses', v_expense_id, 'Retry do estorno', '20000000-0000-4000-8000-000000000001'::uuid
  );
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.create_financial_reversal(
      v_congregation_a, 'expenses', v_expense_id, 'Segundo estorno', '20000000-0000-4000-8000-000000000002'::uuid
    );
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Second integral reversal unexpectedly succeeded.');
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.audit_events WHERE entity = 'financial_reversals' AND entity_id = v_reversal_id),
    'Reversal did not create an audit event.'
  );

  -- Physical cash is independent from bank movements and cannot become negative.
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  SELECT id INTO v_cash_register_id FROM public.create_cash_register(v_congregation_a, 'Caixa de saldo ' || extract(epoch from clock_timestamp())::bigint);
  SELECT id INTO v_cash_period_id FROM public.open_cash_period(v_cash_register_id, v_period, 50000);
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.open_cash_period(v_cash_register_id, v_period, 50000);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Opening the same cash register and period twice unexpectedly succeeded.');
  SELECT count(*) INTO v_count FROM public.physical_cash_periods WHERE cash_register_id = v_cash_register_id AND reference_period = v_period;
  PERFORM public.assert_equal(v_count, 1, 'Duplicate cash opening created a second period.');
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.record_cash_movement(v_cash_period_id, 'cash_expense'::public.cash_movement_type, 60000, 'Despesa acima do saldo', '30000000-0000-4000-8000-000000000000'::uuid);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Cash expense above the expected balance unexpectedly succeeded.');
  PERFORM public.record_cash_movement(v_cash_period_id, 'cash_expense'::public.cash_movement_type, 30000, 'Despesa dentro do saldo', '30000000-0000-4000-8000-000000000004'::uuid);
  SELECT opening_balance_cents + coalesce(sum(case when movement_type = 'cash_in' then amount_cents else -amount_cents end), 0)
  INTO v_after_adjustment
  FROM public.physical_cash_periods p
  LEFT JOIN public.physical_cash_movements m ON m.cash_period_id = p.id
  WHERE p.id = v_cash_period_id
  GROUP BY p.id, p.opening_balance_cents;
  PERFORM public.assert_equal(v_after_adjustment, 20000::bigint, 'Cash balance after a 30000 expense should be 20000.');
  PERFORM public.count_cash(v_cash_period_id, 20000, null);
  PERFORM public.close_cash_period(v_cash_period_id);

  SELECT id INTO v_cash_register_id FROM public.create_cash_register(v_congregation_a, 'Caixa de conferência ' || extract(epoch from clock_timestamp())::bigint);
  SELECT id INTO v_cash_period_id FROM public.open_cash_period(v_cash_register_id, v_period, 50000);
  PERFORM public.record_cash_movement(v_cash_period_id, 'cash_in'::public.cash_movement_type, 100000, 'Entrada em espécie', '30000000-0000-4000-8000-000000000001'::uuid);
  PERFORM public.record_cash_movement(v_cash_period_id, 'cash_expense'::public.cash_movement_type, 30000, 'Despesa em espécie', '30000000-0000-4000-8000-000000000002'::uuid);
  SELECT id INTO v_cash_movement_id FROM public.record_cash_movement(v_cash_period_id, 'deposit'::public.cash_movement_type, 80000, 'Depósito bancário', '30000000-0000-4000-8000-000000000003'::uuid);
  PERFORM public.assert_not_null(v_cash_movement_id, 'Cash movement was not created.');
  PERFORM public.record_cash_movement(v_cash_period_id, 'deposit'::public.cash_movement_type, 80000, 'Retry do depósito', '30000000-0000-4000-8000-000000000003'::uuid);
  SELECT count(*) INTO v_count FROM public.physical_cash_movements WHERE idempotency_key = '30000000-0000-4000-8000-000000000003'::uuid;
  PERFORM public.assert_equal(v_count, 1, 'Cash movement idempotency created duplicate rows.');
  SELECT id INTO v_cash_period_id FROM public.count_cash(v_cash_period_id, 38000, 'Diferença de conferência');
  PERFORM public.assert_equal((SELECT counted_balance_cents FROM public.physical_cash_periods WHERE id = v_cash_period_id), 38000::bigint, 'Counted cash amount was not stored.');
  PERFORM public.assert_equal((SELECT divergence_reason FROM public.physical_cash_periods WHERE id = v_cash_period_id), 'Diferença de conferência', 'Cash divergence reason was not stored.');
  PERFORM public.close_cash_period(v_cash_period_id);
  PERFORM public.assert_equal((SELECT status::text FROM public.physical_cash_periods WHERE id = v_cash_period_id), 'closed', 'Cash period did not close after counting.');

  -- Central admin is congregational in the current model: membership is required
  -- on the target congregation, as has_congregation_role currently defines it.
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  PERFORM public.close_monthly_period(v_congregation_a, v_period);
  PERFORM public.request_period_reopening(v_congregation_a, v_period, 'Solicitação para validar isolamento de aprovação');
  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.approve_period_reopening(
      (SELECT id FROM public.period_reopening_requests WHERE congregation_id = v_congregation_a AND status = 'pending' LIMIT 1)
    );
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Sede central admin approved a Congregação A reopening without target membership.');

  -- Cross-congregation cash remains invisible under authenticated RLS.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  SELECT id INTO v_cash_register_id FROM public.create_cash_register(v_headquarters, 'Caixa da Sede ' || extract(epoch from clock_timestamp())::bigint);
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  SELECT count(*) INTO v_count FROM public.physical_cash_registers WHERE congregation_id = v_headquarters;
  PERFORM public.assert_equal(v_count, 0, 'Congregation A user accessed headquarters cash.');

  -- Closed financial periods reject normal correction commands.
  PERFORM set_config('request.jwt.claim.sub', v_congregation_admin::text, true);
  PERFORM public.close_monthly_period(v_congregation_a, v_period);
  v_operation_succeeded := false;
  BEGIN
    PERFORM public.create_financial_adjustment(v_congregation_a, 'entries', v_entry_id, -1000, 'Ajuste após fechamento', '10000000-0000-4000-8000-000000000003'::uuid);
    v_operation_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_operation_succeeded := false;
  END;
  PERFORM public.assert_equal(v_operation_succeeded, false, 'Adjustment bypassed the closed period.');
END $$;

COMMIT;
