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

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_congregation_a uuid := '22222222-2222-4222-8222-222222222222';
  v_congregation_b uuid := '33333333-3333-4333-8333-333333333333';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_central_admin uuid := '44444444-4444-4444-8444-444444444444';
  v_headquarters uuid := '11111111-1111-4111-8111-111111111111';
  v_visible_count integer;
BEGIN
  IF current_user <> 'authenticated' OR current_role <> 'authenticated' THEN
    RAISE EXCEPTION 'BLOCKED: aggregate RLS assertions must run as authenticated.';
  END IF;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_treasurer::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  PERFORM public.assert_equal(auth.uid(), v_treasurer, 'Authenticated claims must resolve to the fixture treasurer.');
  SELECT count(*) INTO v_visible_count
  FROM public.congregations
  WHERE id IN (v_congregation_a, v_congregation_b);
  PERFORM public.assert_equal(v_visible_count, 1, 'Treasurer from A must see A and not B.');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_central_admin::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  SELECT count(*) INTO v_visible_count
  FROM public.congregations
  WHERE id IN (v_headquarters, v_congregation_a);
  PERFORM public.assert_equal(v_visible_count, 1, 'Central admin must see its headquarters but not an unrelated congregation.');

  PERFORM set_config('request.jwt.claims', '{}', true);
  PERFORM set_config('request.jwt.claim.sub', '', true);
  RAISE NOTICE 'Aggregate RLS assertions passed as authenticated.';
END $$;

COMMIT;
