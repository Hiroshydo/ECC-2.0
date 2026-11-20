---
title: Hiram Architecture
module: hiram
layer: core
status: implementado no codigo
tags: [ecc, hierarquia, multitenant, rls, hiram]
---

# Hiram Architecture

## Propósito e identidade

Estrutura a hierarquia organizacional, o contexto multi-tenant e a consolidação financeira. O nome Hiram representa o módulo de arquitetura da rede.

Acoplamentos: [[Ecclesia Core]], [[Canaa Local]], [[Canaa Access]], [[Khatam Authenticate]].

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
