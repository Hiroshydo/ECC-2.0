---
title: Enoch Audit
module: enoch
layer: core
status: implementado no codigo
tags: [ecc, auditoria, trilha, enoch, core]
---

# Enoch Audit

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/05-enoch-audit.svg" alt="Enoch Audit" width="220">

| Aspecto | Detalhe |
|---|---|
| Status Real | **Implementado no código** |
| Camada | Core / Auditoria |
| Rotas | `/auditoria` |
| Tabelas/RPCs | `audit_events` |
| Arquivos principais | `AuditLog.tsx`, página `/auditoria`, migrations `0001`–`0004` |

## Propósito

Registrar uma trilha consultável das operações críticas e preservar contexto before/after quando disponível.

## Status real

### Implementado
- Página `/auditoria`.
- Componente `AuditLog`.
- Tabela `audit_events`.
- Permissão `audit.read`.
- Eventos emitidos por RPCs de aprovação, repasse, fechamento, correções e administração.
- Filtros por unidade ativa e limite de 200 eventos.

### Limitação
A expressão “imutável” representa a intenção do modelo: não há, neste repositório, rota ou SQL revisado que garanta bloqueio físico universal por trigger para toda alteração futura em `audit_events`. O código inclui registros append-only nas operações, mas não uma política explícita de atualização/deleção encontrada nas migrations.

## Arquivos

- `src/app/(authenticated)/auditoria/page.tsx`
- `src/components/AuditLog.tsx`
- `src/domain/audit.ts`
- tabela `audit_events`
- migrations `0001` e `0002`

## Fluxo

1. A operação entra em uma RPC ou ação administrativa.
2. Antes da mudança, o registro original é convertido em JSON.
3. Após a mudança, o novo registro é convertido em JSON.
4. Um registro é inserido em `audit_events` com `actor_id`, ação, entidade e entidade relacionada.
5. A página lista os eventos da unidade ativa.

Exemplos de ações observadas: `created`, `approved`, `requested`, `confirmed`, `opened`, `counted`, `closed`, `posted`, `updated`.

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
