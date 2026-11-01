-- LOCAL ONLY — nunca aplicar na nuvem.
-- Ecclesia Finance local demonstration seed.
-- Login local: renanmarianosd@hotmail.com / teste

create extension if not exists pgcrypto with schema extensions;

begin;

do $$
declare
  demo_user uuid := 'd0000000-0000-4000-8000-000000000001';
  sede uuid := 'd1000000-0000-4000-8000-000000000001';
  congregacao_esperanca uuid := 'd1000000-0000-4000-8000-000000000002';
  congregacao_campinas uuid := 'd1000000-0000-4000-8000-000000000003';
  congregacao_rio uuid := 'd1000000-0000-4000-8000-000000000004';
  periodo date := date_trunc('month', current_date)::date;
  caixa uuid := 'd2000000-0000-4000-8000-000000000001';
  periodo_caixa uuid := 'd3000000-0000-4000-8000-000000000001';
  entrada_id uuid := 'd4000000-0000-4000-8000-000000000001';
  despesa_id uuid := 'd5000000-0000-4000-8000-000000000001';
begin
  if not exists (select 1 from auth.users where id = demo_user) then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      demo_user,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'renanmarianosd@hotmail.com',
      extensions.crypt('teste', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"central_admin"}'::jsonb,
      '{"name":"Usuário de Homologação","environment":"staging"}'::jsonb,
      now(),
      now()
    );
  end if;

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    demo_user::text,
    demo_user,
    jsonb_build_object('sub', demo_user::text, 'email', 'renanmarianosd@hotmail.com'),
    'email',
    now(), now(), now()
  )
  on conflict (provider_id, provider) do nothing;

  insert into public.congregations (id, name, city, active) values
    (sede, 'Sede Ecclesia', 'São Paulo', true),
    (congregacao_esperanca, 'Congregação Esperança', 'Campinas', true),
    (congregacao_campinas, 'Congregação Vida', 'Belo Horizonte', true),
    (congregacao_rio, 'Congregação Nova Aliança', 'Rio de Janeiro', true)
  on conflict (id) do update set name = excluded.name, city = excluded.city, active = true;

  insert into public.memberships (user_id, congregation_id, role) values
    (demo_user, sede, 'central_admin'),
    (demo_user, congregacao_esperanca, 'central_admin'),
    (demo_user, congregacao_campinas, 'central_admin'),
    (demo_user, congregacao_rio, 'central_admin')
  on conflict (user_id, congregation_id) do update set role = excluded.role;

  insert into public.monthly_closings (congregation_id, reference_period, opening_balance_cents, status)
  values
    (sede, periodo, 125000, 'open'),
    (congregacao_esperanca, periodo, 48200, 'open'),
    (congregacao_campinas, periodo, 73500, 'open'),
    (congregacao_rio, periodo, 91000, 'open')
  on conflict (congregation_id, reference_period) do nothing;

  insert into public.entries (id, congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by)
  values
    (entrada_id, sede, current_date - 8, 86000, 'dizimos', 'Culto de domingo', 'pix', 'Manutenção e ações sociais', demo_user),
    ('d4000000-0000-4000-8000-000000000002', sede, current_date - 3, 42000, 'ofertas', 'Culto de quarta', 'cash', 'Projetos comunitários', demo_user),
    ('d4000000-0000-4000-8000-000000000003', congregacao_esperanca, current_date - 6, 31500, 'dizimos', 'Culto principal', 'pix', 'Despesas da congregação', demo_user),
    ('d4000000-0000-4000-8000-000000000004', congregacao_campinas, current_date - 4, 54000, 'ofertas', 'Celebração mensal', 'transfer', 'Ações ministeriais', demo_user),
    ('d4000000-0000-4000-8000-000000000005', congregacao_rio, current_date - 2, 68000, 'dizimos', 'Culto de domingo', 'pix', 'Operação local', demo_user)
  on conflict (id) do nothing;

  insert into public.expenses (id, congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, approved_by, recorded_by, status, approved_at)
  values
    (despesa_id, sede, current_date - 5, 18700, 'estrutura', 'Manutenção do salão principal', 'Fornecedor demonstrativo', 'transfer', 'Conservação predial', 'administrativo', demo_user, demo_user, 'approved', now()),
    ('d5000000-0000-4000-8000-000000000002', sede, current_date - 1, 9200, 'social', 'Cestas básicas', 'Ação Social Ecclesia', 'pix', 'Atendimento comunitário', 'social', demo_user, demo_user, 'approved', now()),
    ('d5000000-0000-4000-8000-000000000003', congregacao_esperanca, current_date - 3, 6800, 'estrutura', 'Material de limpeza', 'Mercado Local', 'cash', 'Rotina da congregação', 'administrativo', demo_user, demo_user, 'approved', now()),
    ('d5000000-0000-4000-8000-000000000004', congregacao_campinas, current_date - 2, 12400, 'eventos', 'Estrutura de encontro', 'Eventos Vida', 'card', 'Encontro mensal', 'ministerial', demo_user, demo_user, 'approved', now()),
    ('d5000000-0000-4000-8000-000000000005', congregacao_rio, current_date - 1, 15300, 'pessoal', 'Apoio operacional', 'Serviços Nova Aliança', 'transfer', 'Operação local', 'administrativo', demo_user, demo_user, 'pending', null)
  on conflict (id) do nothing;

  insert into public.headquarters_transfers (id, origin_congregation_id, destination_name, reference_period, amount_sent_cents, amount_received_cents, occurred_on, status, reason, requested_by, approved_by)
  values
    ('d6000000-0000-4000-8000-000000000001', congregacao_esperanca, 'Sede Ecclesia', periodo, 8500, 8500, current_date - 2, 'confirmed', 'Repasse mensal demonstrativo', demo_user, demo_user),
    ('d6000000-0000-4000-8000-000000000002', congregacao_campinas, 'Sede Ecclesia', periodo, 12000, null, current_date - 1, 'sent', 'Repasse para validação', demo_user, demo_user)
  on conflict (id) do nothing;

  insert into public.physical_cash_registers (id, congregation_id, name, active, created_by)
  values (caixa, sede, 'Caixa principal', true, demo_user)
  on conflict (id) do nothing;

  insert into public.physical_cash_periods (id, cash_register_id, reference_period, opening_balance_cents, status, created_by)
  values (periodo_caixa, caixa, periodo, 35000, 'open', demo_user)
  on conflict (id) do nothing;

  insert into public.physical_cash_movements (id, cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)
  values
    ('d7000000-0000-4000-8000-000000000001', periodo_caixa, 'cash_in', 18000, 'Oferta em espécie', demo_user, 'd8000000-0000-4000-8000-000000000001'),
    ('d7000000-0000-4000-8000-000000000002', periodo_caixa, 'cash_expense', 6500, 'Compra de materiais', demo_user, 'd8000000-0000-4000-8000-000000000002')
  on conflict (id) do nothing;
end $$;

commit;
