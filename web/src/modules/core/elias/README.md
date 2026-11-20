---
title: Elias Temp
module: elias
layer: core
status: implementado no codigo
tags: [ecc, elias, fechamento]
---

# Elias Temp

Responsabilidade: controlar fechamento mensal e travas temporais retroativas do ciclo financeiro.

## Status

Implementado no código. Consulte [Elias Temp](../../../../../docs/modulos/Elias%20Temp.md).

## Evidências

- `/fechamento`;
- `monthly_closings`;
- `period_reopening_requests`;
- RPC `close_monthly_period`;
- view `congregation_monthly_summary`;
- trigger/função de fechamento das migrations `0002`, `0003` e `0004`.
