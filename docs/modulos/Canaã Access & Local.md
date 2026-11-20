---
title: Canaã Access & Local
module: canaa
layer: core
status: parcialmente implementado
tags: [ecc, core, canaa, unidade, equipe]
---

# Canaã Access & Local

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/08-canaa-access.svg" alt="Canaã Access" width="160">
<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/09-canaa-local.svg" alt="Canaã Local" width="160">

| Status Real | Camada | Rotas | Tabelas / RPCs | Arquivos principais |
|---|---|---|---|---|
| Parcialmente implementado | Core / governança de unidades | `/canaa`, `/admin` | `congregations`, `memberships`, `membership_permission_overrides`, `admin_create_congregation`, `admin_replace_user_access` | `src/modules/core/canaa`, `src/components/AdminManager.tsx`, `src/app/api/admin/*` |

## Responsabilidades

- **Canaã Local:** apresenta unidades visíveis ao usuário, ligações hierárquicas e ferramentas da unidade ativa.
- **Canaã Access:** operações globais de cadastro/edição de unidades, equipe e acessos, limitadas ao Dev Master.
- A edição do grafo atualiza `parent_id` por uma rota administrativa protegida e grava auditoria.

## Fluxos reais

Na rota `/canaa`, o servidor autentica o usuário, carrega as memberships e filtra as unidades por `hierarchy.view` (ou Dev Master). O React Flow mostra as ligações disponíveis. No modo autorizado, alterações visuais são enviadas a `/api/admin/congregations/[id]`; a API exige contexto Dev Master, valida nível e tipo do pai, verifica ciclos e registra o evento em `audit_events`.

O convite local chama `inviteOperatorAction`, valida e-mail/papel, verifica licença com [[Khatam Authenticate]] e usa a service role apenas no servidor. A administração global em `/admin` delega hierarquia e tipos organizacionais a [[Hiram Architecture]].

## Limitações atuais

- `LocalTeamManager` é renderizado com uma lista vazia na página Canaã e ainda não representa o roster consultado do banco.
- Licença é consultada para cotas e convites, mas não é um gate global para todas as rotas.
- A interface global de administração depende de `SUPABASE_SERVICE_ROLE_KEY` exclusivamente server-side.

## Acoplamentos

- [[Hiram Architecture]] — árvore, níveis, permissões e isolamento.
- [[Khatam Authenticate]] — cotas e validade de licença.
- [[Enoch Audit]] — eventos de mudança e convites.
- [[Noah Ops]] — observabilidade atualmente parcial.

## Nomes históricos

- [[Canaa Access]]
- [[Canaa Local]]

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
