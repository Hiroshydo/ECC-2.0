# Relatorio tecnico do Ecclesia Finance

> Atualizado em 11/11/2026. A validacao local registrada abaixo foi feita nesta data; informacoes de cloud/Vercel nao foram revalidadas.

## 1. Identificacao

- **Projeto:** Ecclesia Finance
- **Pasta raiz:** `Ecclesia-Finance`
- **Aplicacao principal:** `web/`
- **Framework:** Next.js 16.3.0
- **Linguagem:** TypeScript 5
- **Runtime de interface:** React 19.2.8
- **Banco e autenticacao:** Supabase/PostgreSQL
- **Deploy previsto:** Vercel, usando `web/` como Root Directory
- **Repositorio:** branch `main` no estado local analisado

## 2. Supabase e chaves

### Ambiente local verificado

- `web/.env.local` aponta para o Supabase local em `http://127.0.0.1:54321` e contém a chave publicável local; valores secretos não são registrados neste documento.
- O PostgreSQL local está na porta `54322`, com PostgreSQL 17.
- As migrations `0001` a `0013` foram aplicadas e a conta demonstrativa autenticou com sucesso no Supabase local.
- Nenhum banco cloud foi alterado ou validado nesta execução.

### Variaveis exigidas pelo frontend

Arquivo: `web/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA_PUBLISHABLE
```

O frontend usa essas variaveis em:

- `web/src/lib/supabase/server.ts`;
- `web/src/lib/supabase/client.ts`;
- middleware/sessao de autenticacao.

### Variaveis para scripts e testes

Arquivo local, nunca commitado:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_CHAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE

DATABASE_URL=postgresql://usuario:senha@host:5432/postgres
PGHOST=host
PGUSER=usuario
PGPASSWORD=senha
PGDATABASE=postgres
PGPORT=5432
```

### Regras de seguranca

- `NEXT_PUBLIC_SUPABASE_URL` pode ser usada no frontend.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou anon key e uma chave publica, protegida por RLS.
- `SUPABASE_SERVICE_ROLE_KEY` e secreta e nunca deve ser enviada ao navegador.
- Senhas, tokens e `DATABASE_URL` nao devem entrar no Git.
- O `.gitignore` ja ignora `.env` e `.env.*`, mantendo somente `.env.example`.
- Se uma chave real foi exposta publicamente, ela deve ser revogada no painel do Supabase.

## 3. Onde obter os dados reais no Supabase

No painel do projeto Supabase:

1. Abra **Project Settings > Data API**.
2. Copie a **Project URL** para `NEXT_PUBLIC_SUPABASE_URL`.
3. Copie a chave publica atual para `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Para testes administrativos, use a conexao PostgreSQL em **Connect** e configure `DATABASE_URL` localmente.
5. Nunca coloque a `service_role` no frontend ou neste relatorio.

## 4. Configuracao local do Supabase

Arquivo: `web/supabase/config.toml`

- `project_id`: `web`
- API local: `http://127.0.0.1:54321`
- PostgreSQL local: porta `54322`
- Supabase Studio local: porta `54323`
- SMTP local: porta `54324`
- Versao PostgreSQL esperada: 17
- Auth local: habilitado
- Realtime: habilitado
- Storage: habilitado
- Limite de resposta da API: 1000 linhas

Essa configuração local não identifica nem conecta automaticamente a um projeto cloud. Mantenha `web/.env.local` apontado para `127.0.0.1` no desenvolvimento. Cloud deve usar configuração e credenciais próprias, depois de confirmar o ambiente de destino.

## 5. Migrations do banco

Aplicar nesta ordem:

1. `web/supabase/migrations/0001_finance_core.sql`
2. `web/supabase/migrations/0002_integrity_and_documents.sql`
3. `web/supabase/migrations/0003_financial_cycle_commands.sql`
4. `web/supabase/migrations/0004_domain_completion.sql`
5. `web/supabase/migrations/0005_domain_completion_fix.sql`
6. `web/supabase/migrations/0006_cash_movement_idempotency_fix.sql`
7. `web/supabase/migrations/0007_performance_indexes.sql`
8. `web/supabase/migrations/0008_organization_admin_permissions.sql`
9. `web/supabase/migrations/0009_hierarchical_scope_permissions.sql`
10. `web/supabase/migrations/0010_congregation_leader_name.sql`
11. `web/supabase/migrations/0011_admin_create_congregation_parent.sql`
12. `web/supabase/migrations/0012_hierarchical_financial_architecture.sql`
13. `web/supabase/migrations/0013_khatam_licenses.sql`

### Estrutura principal criada

- `congregations`
- `memberships`
- `entries`
- `expenses`
- `headquarters_transfers`
- `monthly_closings`
- `audit_events`
- `documents`
- `period_reopening_requests`
- `financial_adjustments`
- `financial_reversals`
- `physical_cash_registers`
- `physical_cash_periods`
- `physical_cash_movements`
- view `congregation_monthly_summary`

### Funcoes/RPCs principais

- `create_entry`
- `create_expense`
- `approve_expense`
- `request_transfer`
- `approve_transfer`
- `confirm_transfer`
- `close_monthly_period`
- `request_period_reopening`
- `approve_period_reopening`
- `create_financial_adjustment`
- `create_financial_reversal`
- `create_cash_register`
- `open_cash_period`
- `record_cash_movement`
- `count_cash`
- `close_cash_period`

## 6. Funcionalidades implementadas

- Login e sessao Supabase.
- Memberships por congregacao.
- Selecao de congregacao ativa.
- Dashboard financeiro da congregacao.
- Registro de entradas.
- Registro e aprovacao de despesas.
- Repasses com solicitacao, aprovacao, confirmacao e divergencia.
- Fechamento mensal.
- Ajustes financeiros auditaveis.
- Estornos integrais auditaveis.
- Caixa fisico com abertura e movimentacao.
- Auditoria por congregacao.
- Relatorios com exportacao PDF e Excel.
- RLS e autorizacao por papel.
- Idempotencia em operacoes de correcao e caixa.
- Indices de desempenho para listagens, auditoria e alertas do dashboard.

## 7. Rotas da aplicacao

### Paginas

- `/login`
- `/`
- `/entradas`
- `/despesas`
- `/repasses`
- `/caixa`
- `/fechamento`
- `/ajustes`
- `/estornos`
- `/auditoria`
- `/relatorios`
- `/configuracoes`

### APIs

- `/api/entries`
- `/api/expenses`
- `/api/expenses/approve`
- `/api/transfers`
- `/api/transfers/approve`
- `/api/transfers/confirm`
- `/api/cash/registers`
- `/api/cash/periods`
- `/api/cash/movements`
- `/api/closing`
- `/api/adjustments`
- `/api/reversals`
- `/api/reports`

## 8. Seguranca atual

- RLS habilitado nas tabelas financeiras.
- Leitura limitada a membros da congregacao.
- Escrita financeira via RPCs ou APIs autorizadas.
- Papeis existentes: `central_admin`, `congregation_admin`, `treasurer`, `auditor`, `viewer`.
- Periodo fechado protegido contra alteracoes diretas.
- Auditoria criada em operacoes financeiras importantes.
- Movimentos de caixa usam idempotencia.
- Chave `service_role` nao e usada pelo frontend.

## 9. O que ainda nao esta implementado

- Dashboard agregado real da sede.
- Modelo de organizacao superior a congregacoes.
- CNPJ e tipos distintos de congregacao.
- Contas bancarias e contas financeiras.
- Pix operacional e webhooks.
- Debito, adquirencia e maquininhas.
- Taxas, parcelas e liquidacao de cartao.
- Conciliacao financeira geral.
- Governanca configuravel, alçadas e dupla aprovacao.
- Entidade de pendencias com responsavel, prazo e resolucao.
- Configuracoes administrativas reais. A rota atual e placeholder.
- Validacao runtime da base contra um Supabase real neste ambiente.

## 10. Validacoes executadas

- `npm --prefix web run lint`: **PASS**
- `npm --prefix web run build`: **PASS**; o Next.js registra mensagens de renderização dinâmica em rotas com cookies, mas conclui o build.
- Migrations locais `0001` a `0013`: **PASS**
- Suíte SQL local: **PASS** nos cinco scripts do runner.
- Login demonstrativo local, `/login` e `/api/health`: **PASS**
- `bash -n database-tests/run_suite.sh` e `git diff --check`: **PASS**
- Supabase cloud/Production: **não validado e não alterado**.

## 11. Comandos principais

### Ambiente local

```bash
cd web
supabase start
supabase db push
```

Para recriar o banco local e carregar o seed, use `supabase db reset` (apaga os dados locais). Na raiz do repositório, inicie o frontend com `npm --prefix web run dev`.

### Testar banco local

```bash
SUPABASE_LOCAL_CONTAINER=supabase_db_web bash database-tests/run_suite.sh
```

O nome do container corresponde ao `project_id = "web"` no arquivo de configuração. O runner grava fixtures no banco, então deve ser usado apenas localmente.

### Ambiente cloud

Não reutilize a configuração local nem presuma que um projeto vinculado seja homologação. Confirme o projeto, faça backup e verifique o histórico antes de qualquer comando `supabase ... --remote`.

## 12. Ordem recomendada para prosseguir

1. Manter o desenvolvimento apontado ao Supabase local.
2. Repetir a suíte local após mudanças de banco.
3. Criar ou confirmar um projeto cloud de homologação separado.
4. Fazer backup, conferir migrations e executar testes nesse projeto antes de qualquer publicação.
5. Configurar Production separadamente; não copiar credenciais de homologação.
6. Implementar sede agregada, configurações e conciliação antes de produção.

## 13. Conclusao

O núcleo local está funcional, com migrations, seed, testes de domínio e autenticação validados. Isso não declara o sistema pronto para produção: cloud, Vercel, controles operacionais e cenários não cobertos pela suíte precisam de validação independente.

## 14. Publicacao Vercel (snapshot de 30/09/2026, nao revalidado)

- **Conta Vercel:** `hyroshydo`
- **Equipe ativa:** `hyroshido1`
- **Projeto:** `ecclesia-finance`
- **Root Directory:** `web`
- **Preview publicado:** `https://ecclesia-finance-amxq938rz-hyroshido1.vercel.app`
- **Status:** `Ready`
- **Health check:** `/api/health` respondeu `status: ok`
- **Protecao de deployment:** habilitada pela Vercel
- **Variaveis de ambiente:** ainda nao configuradas no projeto

O dominio de producao existente e `https://ecclesia-finance-pink.vercel.app`, mas ele so deve ser atualizado depois de configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente Production.

## 15. Homologacao demonstrativa

- **Projeto Vercel:** `ecclesia-finance-a8cp`
- **URL:** `https://ecclesia-finance-a8cp.vercel.app`
- **Status:** `Ready`
- **Health check:** aprovado
- **Seed:** `web/supabase/seed.sql`
- **Documentacao:** `docs/homologacao.md`
- **Banco demo conectado:** não
- **Protecao Vercel:** habilitada

O seed cria o usuario `teste@teste` com senha `teste` somente quando executado em um Supabase de homologacao. Essas credenciais não devem existir em Production.
