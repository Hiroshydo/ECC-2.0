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
