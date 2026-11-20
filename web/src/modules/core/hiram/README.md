---
title: Hiram Architecture
module: hiram
layer: core
status: implementado no codigo
tags: [ecc, hiram, hierarquia]
---

# Hiram Architecture

Responsabilidade: operar o domínio hierárquico e multi-tenant com `parent_id`, níveis organizacionais e vocabulário Igreja/ONG.

## Status

Implementado no código. Consulte [Hiram Architecture](../../../../../docs/modulos/Hiram%20Architecture.md).

## Evidências

- migrations `0008`, `0009`, `0011` e `0012`;
- tabela `congregations`;
- RPC `get_hierarchical_financial_metrics`;
- permissões `hierarchy.view` e `hierarchy.financial.read`;
- componente [Canaa Local](../../../../../docs/modulos/Canaa%20Local.md) com React Flow.
