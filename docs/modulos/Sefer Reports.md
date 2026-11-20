---
title: Sefer Reports
module: sefer
layer: core
status: implementado no codigo
tags: [ecc, relatorios, pdf, excel, sefer]
---

# Sefer Reports

## Propósito

Consolidar dados da unidade ativa para prestação de contas e exportação em PDF e Excel.

## Status real

### Implementado
- Página `/relatorios`.
- Consulta consolidada por período.
- Resumo financeiro.
- Entradas, despesas, repasses, ajustes, estornos, caixa, fechamento e auditoria.
- Exportação PDF com `jsPDF`.
- Exportação Excel com `ExcelJS`.
- Seleção da unidade ativa na interface.

### Limitação
Não há agregação hierárquica explícita de todas as unidades neste relatório; os dados são carregados para a congregação selecionada. A consolidação hierárquica está no dashboard via `get_hierarchical_financial_metrics`.

## Arquivos

- `src/app/(authenticated)/relatorios/page.tsx`
- `src/components/ReportSummary.tsx`
- `src/lib/reports/data.ts`
- `src/app/api/reports/route.ts`
- view `congregation_monthly_summary`

## Como funciona

1. A página cria o período atual.
2. `loadReportData` consulta unidade, resumo mensal e registros do período.
3. A API `/api/reports` verifica `financial.read` e membership.
4. `ReportSummary` monta tabelas em memória.
5. PDF gera cabeçalho, resumo, seções e área de assinaturas.
6. Excel cria abas por categoria a partir das mesmas linhas.

## Dados envolvidos

- `congregations`
- `entries`
- `expenses`
- `headquarters_transfers`
- `financial_adjustments`
- `financial_reversals`
- `physical_cash_periods`
- `physical_cash_movements`
- `monthly_closings`
- `audit_events`
