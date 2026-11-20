---
title: Elias Temp
module: elias
layer: core
status: implementado no codigo
tags: [ecc, fechamento, competencia, elias]
---

# Elias Temp

## Propósito

Controlar o fechamento mensal, consolidar o saldo da competência e impedir alterações retroativas diretamente no período fechado.

## Status real

### Implementado
- Página `/fechamento`.
- RPC `close_monthly_period`.
- Tabela `monthly_closings`.
- View `congregation_monthly_summary`.
- Função `require_open_period`.
- Trigger `prevent_closed_period_changes`.
- Solicitação e aprovação de reabertura no banco.

### Parcial
- O frontend não oferece um fluxo completo de solicitar/reabrir período.
- Estados `submitted`, `approved` e `questioned` existem no enum, mas o fluxo atual fecha diretamente em `closed`.

## Arquivos e tabelas

- `src/app/(authenticated)/fechamento/page.tsx`
- `src/components/ClosingManager.tsx`
- `src/app/api/closing/route.ts`
- `monthly_closings`
- `period_reopening_requests`
- `congregation_monthly_summary`
- migrations `0001`, `0002`, `0003`, `0004`, `0008`

## Fórmula consolidada

```text
Saldo final =
Saldo inicial
+ Entradas
- Despesas
- Repasses
+ Ajustes registrados no fechamento
+ Ajustes financeiros
+ efeito líquido dos estornos
```

A view `congregation_monthly_summary` soma os dados por mês. Para estornos de entradas o efeito é negativo; para estornos de despesas o efeito é positivo.

## Estados

O enum `closing_status` aceita: `open`, `submitted`, `approved`, `questioned`, `closed`.

Na interface atual:
- sem registro: “Sem fechamento”.
- `closed`: período fechado.
- demais estados são apresentados por `presentStatus`.

## Trava temporal

`require_open_period` verifica `period_is_closed` antes de entradas, despesas e repasses. Ajustes e estornos devem usar o fluxo próprio de correção. `prevent_closed_period_changes` adiciona proteção direta em tabelas financeiras.
