# Relatorio tecnico do Ecclesia Finance

> Gerado em 30/09/2026. Este documento descreve o estado verificavel do workspace atual.

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

### O que esta configurado agora

O projeto Supabase identificado para configuração é `qkezodddzzitpswtuekg` (`Ecclesia-Finance`, Oregon). As credenciais e variáveis públicas ainda não estão configuradas no workspace ou na Vercel.

Tambem nao foram encontrados:

- `web/.env.local`;
- `.env.local` na raiz;
- `DATABASE_URL` configurada;
- `PGHOST` configurado;
- URL real de projeto Supabase;
- chave publica real;
- chave `service_role`.

Por isso, não há uma chave real para mostrar. O repositório contém apenas placeholders vazios, e isso é o comportamento correto para não vazar credenciais.

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

Essa configuracao local nao identifica nem conecta automaticamente a um projeto cloud. Para usar o Supabase cloud, ainda e necessario preencher `web/.env.local` e vincular/aplicar as migrations no projeto correto.

## 5. Migrations do banco

Aplicar nesta ordem:

1. `web/supabase/migrations/0001_finance_core.sql`
2. `web/supabase/migrations/0002_integrity_and_documents.sql`
3. `web/supabase/migrations/0003_financial_cycle_commands.sql`
4. `web/supabase/migrations/0004_domain_completion.sql`
5. `web/supabase/migrations/0005_domain_completion_fix.sql`
6. `web/supabase/migrations/0006_cash_movement_idempotency_fix.sql`
7. `web/supabase/migrations/0007_performance_indexes.sql`

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

- `npm run lint`: **PASS**
- `npm run build`: **PASS**
- Diagnosticos TypeScript nos arquivos alterados: **sem erros**
- `git diff --check`: **PASS**
- Suíte SQL de dominio: **BLOCKED** neste ambiente, pois nao ha `bash`, `psql` ou conexao PostgreSQL configurada.

`BLOCKED` nao significa que o banco falhou; significa que o comportamento ainda nao foi provado contra uma instancia real.

## 11. Comandos principais

### Instalar e rodar o frontend

```powershell
cd web
npm install
npm run dev
```

Abrir: `http://localhost:3000`

### Validar frontend

```powershell
cd web
npm run lint
npm run build
npm run start
```

### Aplicar migrations com Supabase CLI

```powershell
cd web
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

### Testar banco

O runner existente esta em `database-tests/run_suite.sh` e requer Bash, `psql` e variaveis de conexao. No Windows, usar Git Bash ou WSL.

```bash
bash database-tests/run_suite.sh
```

## 12. Ordem recomendada para prosseguir

1. Criar ou selecionar o projeto Supabase de desenvolvimento.
2. Preencher `web/.env.local` com URL e chave publica.
3. Vincular o projeto com `supabase link`.
4. Aplicar as migrations 0001 a 0007.
5. Executar a suíte SQL em Git Bash ou WSL.
6. Corrigir falhas reais de RLS, RPC, saldo ou concorrencia.
7. Testar login e fluxos financeiros no frontend.
8. Configurar as mesmas variaveis na Vercel para Development, Preview e Production.
9. Implementar sede agregada, configuracoes e conciliacao antes de producao.

## 13. Conclusao

O nucleo financeiro esta implementado e o frontend compila com sucesso. O projeto ainda nao possui, neste workspace, um Supabase cloud identificado nem credenciais configuradas. O proximo marco tecnico e conectar um ambiente Supabase de desenvolvimento, aplicar todas as migrations e executar os testes reais antes de declarar o sistema pronto para producao.

## 14. Publicacao Vercel verificada

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
