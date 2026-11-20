---
title: Ecclesia Core
module: ecclesia
layer: core
status: parcialmente implementado
tags: [ecc, financeiro, core, entradas, despesas, caixa]
---

# Ecclesia Core — Núcleo Transacional

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/00-ecclesia-finance-core.svg" alt="Ecclesia Core" width="220">

| Aspecto | Detalhe |
|---|---|
| Status Real | **Parcialmente implementado** |
| Camada | Core |
| Rotas | `/entradas`, `/despesas`, `/repasses`, `/caixa`, `/ajustes`, `/estornos` |
| Tabelas/RPCs | `entries`, `expenses`, `headquarters_transfers`, `physical_cash_*`, `create_*`, `approve_*`, `confirm_transfer` |
| Arquivos principais | `src/components/*Manager.tsx`, `src/app/api/*`, `src/app/actions/finance.ts` |

## Propósito e identidade

Responsável pelas operações financeiras da unidade ativa: entradas, despesas, repasses, caixa físico, ajustes e estornos.

Acoplamentos centrais: [[Hiram Architecture]], [[Elias Temp]], [[Enoch Audit]], [[Sefer Reports]].

## Status real no código

### Implementado no código
- Páginas `/entradas`, `/despesas`, `/repasses`, `/caixa`, `/ajustes`, `/estornos`.
- Managers: `EntryManager`, `ExpenseManager`, `TransferManager`, `CashManager`, `CorrectionManager`.
- RPCs de criação, aprovação, confirmação, ajustes, estornos e caixa.
- Permissões por papel e override.
- Validação positiva e não negativa de valores em centavos.
- Idempotência para movimentos de caixa e correções.
- Marcação `is_internal_transfer` para excluir repasses internos da consolidação.

### Parcial
- Fluxo de caixa não implementa contagem/fechamento completo na UI.
- Ajustes e estornos usam UUID informado manualmente.
- Reabertura existe no banco, mas não é um fluxo completo nas telas documentadas.

### Planejado
- Contas bancárias, Pix operacional, adquirência, maquininhas e parcelas.
- Fluxos fiscais e de documentos plugáveis em [[Shofeet Note]].

## Arquivos reais

- Páginas: `web/src/app/(authenticated)/entradas`, `despesas`, `repasses`, `caixa`, `ajustes`, `estornos`.
- APIs: `web/src/app/api/entries`, `expenses`, `transfers`, `cash`, `adjustments`, `reversals`.
- Server Actions: `web/src/app/actions/finance.ts`.
- Componentes: `web/src/components/*Manager.tsx`.
- Domínio: `web/src/domain/finance.ts`.
- Banco: migrations `0001` a `0012`.

## Como funciona internamente

1. A página consulta membership e unidade ativa.
2. Verifica a permission via `can(...)`.
3. Consulta a tabela correspondente e o fechamento do período atual.
4. O Manager envia JSON via `/api/...`.
5. `authenticatedRpc` autentica o usuário e chama a RPC.
6. A RPC verifica papel, período aberto e escreve em uma transação.
7. Eventos críticos são inseridos em `audit_events`.

### Entradas
`create_entry` exige autorização de escrita e cria um registro em `entries`. O campo `is_internal_transfer` permite excluir transferências internas da consolidação hierárquica.

### Despesas
`create_expense` cria status `pending`; `approve_expense` exige aprovador e muda para `approved`, com auditoria before/after.

### Repasses
Fluxo real: `requested -> approved -> sent -> confirmed`, podendo gerar `questioned` quando o valor recebido diverge. A confirmação atual exige `central_admin`.

### Ajustes e estornos
Os registros ficam em `financial_adjustments` e `financial_reversals`, com motivo, período, entidade relacionada e chave de idempotência.

### Caixa
Existem caixas físicos, períodos mensais e movimentos com chave de idempotência. A UI calcula o saldo como saldo inicial mais entradas menos saídas/depositos.

## Expurgo de repasses internos

Os campos `is_internal_transfer` existem em `entries` e `expenses`. `get_hierarchical_financial_metrics` ignora esses registros no modo consolidado. Isso evita que movimentações internas sejam contadas como receitas ou despesas novas em múltiplos níveis da hierarquia.

<!-- AUTO-SYNC:START -->
## Inventário sincronizado do código

> Gerado por `npm run docs:sync`. Conteúdo entre estes marcadores não deve ser editado manualmente.

### Rotas autenticadas

- `/admin` — [web/src/app/(authenticated)/admin/page.tsx](../../web/src/app/(authenticated)/admin/page.tsx)
- `/ajustes` — [web/src/app/(authenticated)/ajustes/page.tsx](../../web/src/app/(authenticated)/ajustes/page.tsx)
- `/auditoria` — [web/src/app/(authenticated)/auditoria/page.tsx](../../web/src/app/(authenticated)/auditoria/page.tsx)
- `/caixa` — [web/src/app/(authenticated)/caixa/page.tsx](../../web/src/app/(authenticated)/caixa/page.tsx)
- `/canaa` — [web/src/app/(authenticated)/canaa/page.tsx](../../web/src/app/(authenticated)/canaa/page.tsx)
- `/configuracoes` — [web/src/app/(authenticated)/configuracoes/page.tsx](../../web/src/app/(authenticated)/configuracoes/page.tsx)
- `/despesas` — [web/src/app/(authenticated)/despesas/page.tsx](../../web/src/app/(authenticated)/despesas/page.tsx)
- `/entradas` — [web/src/app/(authenticated)/entradas/page.tsx](../../web/src/app/(authenticated)/entradas/page.tsx)
- `/estornos` — [web/src/app/(authenticated)/estornos/page.tsx](../../web/src/app/(authenticated)/estornos/page.tsx)
- `/fechamento` — [web/src/app/(authenticated)/fechamento/page.tsx](../../web/src/app/(authenticated)/fechamento/page.tsx)
- `/noah-ops` — [web/src/app/(authenticated)/noah-ops/page.tsx](../../web/src/app/(authenticated)/noah-ops/page.tsx)
- `/` — [web/src/app/(authenticated)/page.tsx](../../web/src/app/(authenticated)/page.tsx)
- `/relatorios` — [web/src/app/(authenticated)/relatorios/page.tsx](../../web/src/app/(authenticated)/relatorios/page.tsx)
- `/repasses` — [web/src/app/(authenticated)/repasses/page.tsx](../../web/src/app/(authenticated)/repasses/page.tsx)

### APIs

- [web/src/app/api/adjustments/route.ts](../../web/src/app/api/adjustments/route.ts)
- [web/src/app/api/admin/congregations/[id]/route.ts](../../web/src/app/api/admin/congregations/[id]/route.ts)
- [web/src/app/api/admin/congregations/route.ts](../../web/src/app/api/admin/congregations/route.ts)
- [web/src/app/api/admin/overview/route.ts](../../web/src/app/api/admin/overview/route.ts)
- [web/src/app/api/admin/users/[userId]/access/route.ts](../../web/src/app/api/admin/users/[userId]/access/route.ts)
- [web/src/app/api/admin/users/route.ts](../../web/src/app/api/admin/users/route.ts)
- [web/src/app/api/cash/movements/route.ts](../../web/src/app/api/cash/movements/route.ts)
- [web/src/app/api/cash/periods/route.ts](../../web/src/app/api/cash/periods/route.ts)
- [web/src/app/api/cash/registers/route.ts](../../web/src/app/api/cash/registers/route.ts)
- [web/src/app/api/closing/route.ts](../../web/src/app/api/closing/route.ts)
- [web/src/app/api/entries/route.ts](../../web/src/app/api/entries/route.ts)
- [web/src/app/api/expenses/approve/route.ts](../../web/src/app/api/expenses/approve/route.ts)
- [web/src/app/api/expenses/route.ts](../../web/src/app/api/expenses/route.ts)
- [web/src/app/api/financial/hierarchical-metrics/route.ts](../../web/src/app/api/financial/hierarchical-metrics/route.ts)
- [web/src/app/api/health/route.ts](../../web/src/app/api/health/route.ts)
- [web/src/app/api/reports/route.ts](../../web/src/app/api/reports/route.ts)
- [web/src/app/api/reversals/route.ts](../../web/src/app/api/reversals/route.ts)
- [web/src/app/api/transfers/approve/route.ts](../../web/src/app/api/transfers/approve/route.ts)
- [web/src/app/api/transfers/confirm/route.ts](../../web/src/app/api/transfers/confirm/route.ts)
- [web/src/app/api/transfers/route.ts](../../web/src/app/api/transfers/route.ts)

### Migrations

- [web/supabase/migrations/0001_finance_core.sql](../../web/supabase/migrations/0001_finance_core.sql)
- [web/supabase/migrations/0002_integrity_and_documents.sql](../../web/supabase/migrations/0002_integrity_and_documents.sql)
- [web/supabase/migrations/0003_financial_cycle_commands.sql](../../web/supabase/migrations/0003_financial_cycle_commands.sql)
- [web/supabase/migrations/0004_domain_completion.sql](../../web/supabase/migrations/0004_domain_completion.sql)
- [web/supabase/migrations/0005_domain_completion_fix.sql](../../web/supabase/migrations/0005_domain_completion_fix.sql)
- [web/supabase/migrations/0006_cash_movement_idempotency_fix.sql](../../web/supabase/migrations/0006_cash_movement_idempotency_fix.sql)
- [web/supabase/migrations/0007_performance_indexes.sql](../../web/supabase/migrations/0007_performance_indexes.sql)
- [web/supabase/migrations/0008_organization_admin_permissions.sql](../../web/supabase/migrations/0008_organization_admin_permissions.sql)
- [web/supabase/migrations/0009_hierarchical_scope_permissions.sql](../../web/supabase/migrations/0009_hierarchical_scope_permissions.sql)
- [web/supabase/migrations/0010_congregation_leader_name.sql](../../web/supabase/migrations/0010_congregation_leader_name.sql)
- [web/supabase/migrations/0011_admin_create_congregation_parent.sql](../../web/supabase/migrations/0011_admin_create_congregation_parent.sql)
- [web/supabase/migrations/0012_hierarchical_financial_architecture.sql](../../web/supabase/migrations/0012_hierarchical_financial_architecture.sql)
- [web/supabase/migrations/0013_khatam_licenses.sql](../../web/supabase/migrations/0013_khatam_licenses.sql)

### Código dos módulos

- [web/src/modules/core/canaa/README.md](../../web/src/modules/core/canaa/README.md)
- [web/src/modules/core/canaa/actions/canaa.actions.ts](../../web/src/modules/core/canaa/actions/canaa.actions.ts)
- [web/src/modules/core/canaa/components/CongregationFlowMap.tsx](../../web/src/modules/core/canaa/components/CongregationFlowMap.tsx)
- [web/src/modules/core/canaa/components/CongregationNode.tsx](../../web/src/modules/core/canaa/components/CongregationNode.tsx)
- [web/src/modules/core/canaa/components/InviteOperatorModal.tsx](../../web/src/modules/core/canaa/components/InviteOperatorModal.tsx)
- [web/src/modules/core/canaa/components/LocalTeamManager.tsx](../../web/src/modules/core/canaa/components/LocalTeamManager.tsx)
- [web/src/modules/core/canaa/components/ModuleArchitectureMap.tsx](../../web/src/modules/core/canaa/components/ModuleArchitectureMap.tsx)
- [web/src/modules/core/canaa/components/NoahTelemetryGrid.tsx](../../web/src/modules/core/canaa/components/NoahTelemetryGrid.tsx)
- [web/src/modules/core/canaa/types.ts](../../web/src/modules/core/canaa/types.ts)
- [web/src/modules/core/elias/README.md](../../web/src/modules/core/elias/README.md)
- [web/src/modules/core/enoch/README.md](../../web/src/modules/core/enoch/README.md)
- [web/src/modules/core/hiram/README.md](../../web/src/modules/core/hiram/README.md)
- [web/src/modules/core/khatam/README.md](../../web/src/modules/core/khatam/README.md)
- [web/src/modules/core/khatam/components/KhatamQuotaBar.tsx](../../web/src/modules/core/khatam/components/KhatamQuotaBar.tsx)
- [web/src/modules/core/khatam/services/license.service.ts](../../web/src/modules/core/khatam/services/license.service.ts)
- [web/src/modules/core/khatam/services/license.shared.ts](../../web/src/modules/core/khatam/services/license.shared.ts)
- [web/src/modules/core/sefer/README.md](../../web/src/modules/core/sefer/README.md)
- [web/src/modules/plugins/gideon/README.md](../../web/src/modules/plugins/gideon/README.md)
- [web/src/modules/plugins/shofeet/README.md](../../web/src/modules/plugins/shofeet/README.md)

### Editor do grafo e console Noah

- [web/src/modules/core/canaa/components/CongregationFlowMap.tsx](../../web/src/modules/core/canaa/components/CongregationFlowMap.tsx) — conexão React Flow habilitada; layout Dagre.
- [web/src/app/(authenticated)/noah-ops/page.tsx](../../web/src/app/(authenticated)/noah-ops/page.tsx) — inclui mapa de arquitetura ECC.

<!-- AUTO-SYNC:END -->
