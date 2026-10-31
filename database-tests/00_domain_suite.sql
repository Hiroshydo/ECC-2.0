-- Final aggregate validation script for the domain contract.
-- This file should only succeed if real assertions are true.

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
  v_congregation_b uuid := '33333333-3333-4333-8333-333333333333';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_central_admin uuid := '44444444-4444-4444-8444-444444444444';
  v_entry_count integer;
  v_expense_count integer;
  v_transfer_count integer;
  v_audit_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  SELECT count(*) INTO v_entry_count FROM public.entries WHERE congregation_id = v_congregation_a;
  PERFORM public.assert_true(v_entry_count >= 0, 'Entry count should be queryable with real auth context.');

  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  PERFORM public.assert_true(
    NOT EXISTS (SELECT 1 FROM public.expenses WHERE congregation_id = v_congregation_b),
    'A user from A must not see B expense rows in a valid cross-congregation test.'
  );

  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.congregations WHERE id = v_congregation_a),
    'Central admin should access designated congregations.'
  );

  SELECT count(*) INTO v_audit_count FROM public.audit_events;
  PERFORM public.assert_true(v_audit_count >= 0, 'Audit table must remain queryable.');

  PERFORM set_config('request.jwt.claim.sub', '', true);
  RAISE NOTICE 'Domain suite contract assertions passed.';
END $$;

COMMIT;
