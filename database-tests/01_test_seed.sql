-- Test seed for Ecclesia Finance.
-- This script creates isolated fixture data only.
-- It must be executed with a database context that can write into auth.users.
-- Otherwise the suite is BLOCKED and must not fake authentication.

BEGIN;

DO $$
DECLARE
  v_headquarters uuid := '11111111-1111-4111-8111-111111111111';
  v_congregation_a uuid := '22222222-2222-4222-8222-222222222222';
  v_congregation_b uuid := '33333333-3333-4333-8333-333333333333';
  v_central_admin uuid := '44444444-4444-4444-8444-444444444444';
  v_headquarters_admin uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  v_congregation_admin uuid := '55555555-5555-4555-8555-555555555555';
  v_treasurer uuid := '66666666-6666-4666-8666-666666666666';
  v_auditor uuid := '77777777-7777-4777-8777-777777777777';
  v_viewer uuid := '88888888-8888-4888-8888-888888888888';
  v_b_treasurer uuid := '99999999-9999-4999-8999-999999999999';
  v_fixture_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'BLOCKED: auth.users is not available in this PostgreSQL execution context.';
  END IF;

  BEGIN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token
    ) VALUES
      (v_central_admin, 'central_admin.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_headquarters_admin, 'headquarters_admin.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_congregation_admin, 'congregation_admin.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_treasurer, 'treasurer.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_auditor, 'auditor.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_viewer, 'viewer.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', ''),
      (v_b_treasurer, 'b_treasurer.fixture@ecclesia.test', 'test_fixture_password', now(), now(), now(), now(), '{"provider":"email"}', '{"fixture":"true"}', false, 'authenticated', 'authenticated', '', '', '', '', NULL, NULL, '', '')
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'BLOCKED: auth.users fixtures cannot be created from this execution context. Use a service-role or authenticated admin context.';
  END;

  INSERT INTO public.congregations (id, name, city, active)
  VALUES
    (v_headquarters, 'Sede', 'São Paulo', true),
    (v_congregation_a, 'Congregação A', 'Campinas', true),
    (v_congregation_b, 'Congregação B', 'Rio de Janeiro', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.memberships (user_id, congregation_id, role)
  VALUES
    (v_central_admin, v_headquarters, 'central_admin'),
    (v_headquarters_admin, v_headquarters, 'congregation_admin'),
    (v_congregation_admin, v_congregation_a, 'congregation_admin'),
    (v_treasurer, v_congregation_a, 'treasurer'),
    (v_auditor, v_congregation_a, 'auditor'),
    (v_viewer, v_congregation_a, 'viewer'),
    (v_b_treasurer, v_congregation_b, 'treasurer')
  ON CONFLICT DO NOTHING;

  SELECT count(*) INTO v_fixture_count
  FROM public.memberships
  WHERE congregation_id IN (v_headquarters, v_congregation_a, v_congregation_b);

  IF v_fixture_count < 7 THEN
    RAISE EXCEPTION 'BLOCKED: fixture memberships not created as expected.';
  END IF;

  RAISE NOTICE 'Fixture seed created for headquarters, congregation A and congregation B.';
END $$;

COMMIT;
