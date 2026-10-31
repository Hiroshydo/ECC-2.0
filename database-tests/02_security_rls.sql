-- Real security, RLS and RBAC contract tests.
-- These assertions are executed against the current PostgreSQL/Supabase session.

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

-- Direct psql starts as postgres. This is only a fixture/setup privilege; all
-- policy assertions below run as authenticated so postgres cannot bypass RLS.
SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_headquarters uuid := '11111111-1111-4111-8111-111111111111';
  v_congregation_a uuid := '22222222-2222-4222-8222-222222222222';
  v_congregation_b uuid := '33333333-3333-4333-8333-333333333333';
  v_central_admin uuid := '44444444-4444-4444-8444-444444444444';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_auditor uuid := '77777777-7777-4777-8777-777777777777';
  v_viewer uuid := '88888888-8888-4888-8888-888888888888';
  v_b_treasurer uuid := '99999999-9999-4999-8999-999999999999';
  v_visible_in_a int;
  v_visible_in_b int;
  v_visible_headquarters int;
  v_write_succeeded boolean;
  v_effective_user name;
  v_effective_role name;
  v_effective_uid uuid;
BEGIN
  SELECT current_user, current_role, auth.uid()
  INTO v_effective_user, v_effective_role, v_effective_uid;
  IF v_effective_user <> 'authenticated' OR v_effective_role <> 'authenticated' THEN
    RAISE EXCEPTION 'BLOCKED: RLS test is not running as authenticated (user=%, role=%).', v_effective_user, v_effective_role;
  END IF;

  -- User A is allowed to read their own congregation.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_treasurer::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  SELECT auth.uid() INTO v_effective_uid;
  IF v_effective_uid IS DISTINCT FROM v_treasurer THEN
    RAISE EXCEPTION 'BLOCKED: auth.uid() does not follow the authenticated claims (uid=% expected=%).', v_effective_uid, v_treasurer;
  END IF;
  SELECT count(*) INTO v_visible_in_a
  FROM public.congregations
  WHERE id = v_congregation_a;
  PERFORM public.assert_equal(v_visible_in_a, 1, 'User from congregation A cannot access own congregation.');

  -- User A must not see B.
  SELECT count(*) INTO v_visible_in_b
  FROM public.congregations
  WHERE id = v_congregation_b;
  PERFORM public.assert_equal(v_visible_in_b, 0, 'RLS failed: congregation A user accessed congregation B.');

  -- A user from B must not see A.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_b_treasurer::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_b_treasurer::text, true);
  SELECT count(*) INTO v_visible_in_a
  FROM public.congregations
  WHERE id = v_congregation_a;
  PERFORM public.assert_equal(v_visible_in_a, 0, 'RLS failed: congregation B user accessed congregation A.');

  -- Central admin has only the access granted by its current membership.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_central_admin::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_central_admin::text, true);
  SELECT count(*) INTO v_visible_headquarters
  FROM public.congregations
  WHERE id = v_headquarters;
  PERFORM public.assert_equal(v_visible_headquarters, 1, 'Central admin cannot access its headquarters congregation.');
  SELECT count(*) INTO v_visible_in_a
  FROM public.congregations
  WHERE id = v_congregation_a;
  PERFORM public.assert_equal(v_visible_in_a, 0, 'Central admin received access outside its current membership.');

  -- Auditor can read records.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_auditor::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_auditor::text, true);
  SELECT count(*) INTO v_visible_in_a FROM public.congregations WHERE id = v_congregation_a;
  PERFORM public.assert_equal(v_visible_in_a, 1, 'Auditor should read the authorized congregation.');

  -- Viewer can read but cannot alter.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_viewer::text, 'role', 'authenticated', 'aud', 'authenticated')::text, true);
  PERFORM set_config('request.jwt.claim.sub', v_viewer::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM public.assert_true(
    EXISTS (SELECT 1 FROM public.congregations WHERE id = v_congregation_a),
    'Viewer should read the attached congregation.'
  );

  v_write_succeeded := false;
  BEGIN
    INSERT INTO public.entries (congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
    VALUES (v_congregation_a, current_date, 12345, 'tithe', 'fixture', 'pix', 'viewer_should_fail', v_viewer);
    v_write_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_write_succeeded := false;
  END;
  PERFORM public.assert_equal(v_write_succeeded, false, 'Viewer write unexpectedly succeeded.');

  -- A user from A cannot execute a financial operation for B.
  PERFORM set_config('request.jwt.claim.sub', v_treasurer::text, true);
  v_write_succeeded := false;
  BEGIN
    PERFORM public.create_entry(v_congregation_b, current_date, 100, 'tithe', 'fixture', 'pix', 'cross_congregation_should_fail');
    v_write_succeeded := true;
  EXCEPTION WHEN OTHERS THEN
    v_write_succeeded := false;
  END;
  PERFORM public.assert_equal(v_write_succeeded, false, 'Treasurer from A executed a financial operation for B.');

  -- Membership itself must remain isolated.
  PERFORM public.assert_true(
    NOT EXISTS (
      SELECT 1 FROM public.memberships
      WHERE user_id = v_treasurer AND congregation_id = v_congregation_b
    ),
    'Treasurer from congregation A should not have membership in congregation B.'
  );

  RAISE NOTICE 'Security assertions executed as authenticated with auth.uid()=%.' , v_treasurer;
END $$;

COMMIT;
