# Ambiente de homologação

## Objetivo

A homologação é um ambiente isolado para demonstração com dados fictícios. Não compartilhe banco, usuários ou credenciais com Production.

## Seed demonstrativo

O arquivo `web/supabase/seed.sql` cria de forma idempotente:

- quatro congregações e um usuário `central_admin`;
- entradas, despesas aprovadas e pendentes e repasses;
- caixa físico, movimentos e fechamento mensal;
- dados para testar dashboard, relatórios e navegação.

O seed cria o login `teste@teste` com senha `teste`. Essas credenciais são fracas e devem existir somente em ambiente local ou de homologação, nunca em produção.

## Execução local

Com Docker e Supabase CLI instalados, a partir da raiz:

```bash
cd web
supabase start
supabase db reset
```

`db reset` recria o banco local, aplica as migrations `0001` a `0013` e executa o seed de `supabase/config.toml`. **Todos os dados atuais do banco local são apagados.** Para preservar os dados, aplique apenas migrations pendentes com `supabase db push` e carregue o seed explicitamente.

Configure `web/.env.local` com `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` e a chave publicável apresentada por `supabase status`. Na raiz do repositório, rode `npm --prefix web run dev` e acesse `http://localhost:3000`.

Para validar as regras de banco, siga [database-tests/supabase-setup.md](../database-tests/supabase-setup.md). A suíte grava fixtures no banco; use somente o ambiente local descartável.

## Supabase cloud de homologação

1. Crie ou confirme um projeto Supabase exclusivo de homologação; não presuma que um projeto já vinculado ao CLI seja homologação.
2. Faça backup e confirme o projeto de destino.
3. Aplique as migrations `0001` a `0013`, em ordem.
4. Execute o seed por um fluxo protegido, autenticado como administrador, somente nesse projeto.
5. Confirme no painel Auth que o usuário demonstrativo foi criado.

O seed não é aplicado por `supabase db push` sem a opção de seed. Nunca execute o seed ou a suíte de fixtures em produção.

## Vercel

No projeto de homologação:

- Root Directory: `web`;
- Framework: Next.js;
- `NEXT_PUBLIC_SUPABASE_URL`: URL do Supabase de homologação;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publicável do Supabase de homologação.

Configure as variáveis em Preview e Development. Não coloque `service_role`, senha de banco ou `DATABASE_URL` nas variáveis públicas da aplicação.

## Validação

1. Abra `/login` no ambiente de homologação.
2. Entre com o usuário demonstrativo.
3. Alterne entre as congregações e confira dashboard, entradas, despesas, repasses, caixa, fechamento, ajustes, estornos, auditoria e relatórios.
4. Teste escritas somente no banco de homologação.
5. Confirme que nenhum dado aparece no projeto Production.

## Estado

O Supabase local recebeu as migrations até `0013_khatam_licenses.sql` e a suíte de domínio passou localmente. Isso não valida nem altera os projetos Supabase cloud; a homologação cloud e produção devem ser verificadas separadamente.
