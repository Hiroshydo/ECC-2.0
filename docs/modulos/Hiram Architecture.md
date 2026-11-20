---
title: Hiram Architecture
module: hiram
layer: core
status: implementado no codigo
tags: [ecc, hierarquia, multitenant, rls, hiram, core]
---

# Hiram Architecture

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/04-hiram-architecture.svg" alt="Hiram Architecture" width="220">

| Aspecto | Detalhe |
|---|---|
| Status Real | **Implementado no código** |
| Camada | Core |
| Rotas | `/`, `/canaa`, `/admin` |
| Tabelas/RPCs | `congregations`, `memberships`, `membership_permission_overrides`, `get_hierarchical_financial_metrics` |
| Arquivos principais | migrations `0008`–`0012`, `hierarchical-metrics/route.ts`, `HierarchicalDashboard.tsx` |

## Propósito e identidade

Estrutura a hierarquia organizacional, o contexto multi-tenant e a consolidação financeira. O nome Hiram representa o módulo de arquitetura da rede.

Acoplamentos: [[Ecclesia Core]], [[Canaã Access & Local]], [[Khatam Authenticate]].

## Status real no código

### Implementado no código
- Colunas `parent_id`, `organization_type`, `is_headquarters` e `organization_level`.
- Níveis: `national_hq`, `state_hq`, `sub_hq`, `local_congregation`.
- RPC `get_hierarchical_financial_metrics`.
- Visão local e consolidada no dashboard.
- Permissões `hierarchy.view` e `hierarchy.financial.read`.
- Ações Canaã para criar vínculos hierárquicos e prevenir ciclos.
- Vocabulário `church` e `ong`.

## Estrutura SQL

Entidades envolvidas:
- `congregations`
- `memberships`
- `membership_permission_overrides`
- `entries`
- `expenses`

Migrations principais:
- `0008_organization_admin_permissions.sql`
- `0009_hierarchical_scope_permissions.sql`
- `0011_admin_create_congregation_parent.sql`
- `0012_hierarchical_financial_architecture.sql`

## Como funciona

1. Cada unidade guarda `parent_id`.
2. A migration valida relações permitidas entre níveis.
3. O Dev Master pode criar unidades e vincular pais pela administração global.
4. A interface de Canaã monta nós e arestas com React Flow.
5. `get_hierarchical_financial_metrics` calcula recursivamente a árvore de unidades.
6. O modo local exige `financial.read`.
7. O modo consolidado exige `hierarchy.financial.read`.
8. O RPC soma entradas e despesas, excluindo `is_internal_transfer` no consolidado.

## Vocabulário dinâmico

`getVocabulary()` retorna termos diferentes para igreja ou ONG:

- igreja: Congregação, Dízimos, Ofertas, Missões, Sede, Pastor.
- ONG: Unidade/Projeto, Doações, Campanhas/Editais, Matriz, Diretor.

## Isolamento multi-tenant

O RLS usa memberships para limitar leituras. Operações financeiras são autorizadas por funções de permissão no PostgreSQL. Há também isolamento por unidade ativa no frontend por cookie, mas o controle definitivo permanece no banco.

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
- [02 - Telemetria & Contas Ao Vivo.md](../02 - Telemetria & Contas Ao Vivo.md) — snapshot Supabase; atualização periódica disponível com `npm run docs:watch`.

<!-- AUTO-SYNC:END -->
