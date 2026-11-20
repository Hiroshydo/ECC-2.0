---
title: Canaã Access & Local
module: canaa
layer: core
status: parcialmente implementado
tags: [ecc, core, canaa, unidade, equipe]
---

# Canaã Access & Local

| Status Real | Camada | Rotas | Tabelas / RPCs | Arquivos principais |
|---|---|---|---|---|
| Parcialmente implementado | Core / governança de unidades | `/canaa`, `/admin` | `congregations`, `memberships`, `membership_permission_overrides`, `admin_create_congregation`, `admin_replace_user_access` | `src/modules/core/canaa`, `src/components/AdminManager.tsx`, `src/app/api/admin/*` |

## Responsabilidades

- **Canaã Local:** apresenta unidades visíveis ao usuário, ligações hierárquicas e ferramentas da unidade ativa.
- **Canaã Access:** operações globais de cadastro/edição de unidades, equipe e acessos, limitadas ao Dev Master.
- A edição do grafo atualiza `parent_id` por uma rota administrativa protegida e grava auditoria.

## Fluxos reais

Na rota `/canaa`, o servidor autentica o usuário, carrega as memberships e filtra as unidades por `hierarchy.view` (ou Dev Master). O React Flow mostra as ligações disponíveis. No modo autorizado, alterações visuais são enviadas a `/api/admin/congregations/[id]`; a API exige contexto Dev Master, valida nível e tipo do pai, verifica ciclos e registra o evento em `audit_events`.

O convite local chama `inviteOperatorAction`, valida e-mail/papel, verifica licença com [Khatam Authenticate](Khatam%20Authenticate.md) e usa a service role apenas no servidor. A administração global em `/admin` delega hierarquia e tipos organizacionais a [Hiram Architecture](Hiram%20Architecture.md).

## Limitações atuais

- `LocalTeamManager` é renderizado com uma lista vazia na página Canaã e ainda não representa o roster consultado do banco.
- Licença é consultada para cotas e convites, mas não é um gate global para todas as rotas.
- A interface global de administração depende de `SUPABASE_SERVICE_ROLE_KEY` exclusivamente server-side.

## Acoplamentos

- [Hiram Architecture](Hiram%20Architecture.md) — árvore, níveis, permissões e isolamento.
- [Khatam Authenticate](Khatam%20Authenticate.md) — cotas e validade de licença.
- [Enoch Audit](Enoch%20Audit.md) — eventos de mudança e convites.
- [Noah Ops](Noah%20Ops.md) — observabilidade atualmente parcial.

## Nomes históricos

- [Canaa Access](Canaa%20Access.md)
- [Canaa Local](Canaa%20Local.md)
