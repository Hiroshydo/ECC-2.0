---
title: Khatam Authenticate
module: khatam
layer: core
status: parcialmente implementado
tags: [ecc, licencas, operadores, khatam]
---

# Khatam Authenticate

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/01-khatam-authenticate.svg" alt="Khatam Authenticate" width="220">

| Aspecto | Detalhe |
|---|---|
| Status Real | **Parcialmente implementado** |
| Camada | Core / Licenciamento |
| Rotas | `/canaa`, convite de operadores |
| Tabelas/RPCs | `khatam_licenses`, `memberships` |
| Arquivos principais | `license.service.ts`, `license.shared.ts`, `KhatamQuotaBar.tsx`, migration `0013` |

## Propósito

Controlar licenças comerciais da unidade por número de vagas e data de validade.

## Status real

### Implementado no código
- Tabela `khatam_licenses`.
- Colunas `seats_total` e `expires_at`.
- `getLicense()` consulta licença e conta memberships.
- `checkSeat()` valida validade e disponibilidade.
- `KhatamQuotaBar` apresenta vagas usadas, restantes e vencimento.
- Convidar operador em Canaã bloqueia quando sem licença, vencida ou sem vagas.
- Migration `0013_khatam_licenses.sql`.

### Parcial
- Não existe campo de ciclo comercial chamado `cycle_days` ou lógica universal de 30 dias no banco.
- Não há renovação administrativa completa na UI.
- Não há middleware global bloqueando todas as funcionalidades por licença.
- O convite depende de `SUPABASE_SERVICE_ROLE_KEY` e consulta separada.

### Planejado
- Gestão completa de planos e ciclos.
- Vínculo com pagamentos.
- Suspensão automática por licença.
- Telemetria de uso por operação.

## Arquivos

- `src/modules/core/khatam/components/KhatamQuotaBar.tsx`
- `src/modules/core/khatam/services/license.service.ts`
- `src/modules/core/khatam/services/license.shared.ts`
- `src/modules/core/canaa/actions/canaa.actions.ts`
- `src/app/(authenticated)/canaa/page.tsx`
- `supabase/migrations/0013_khatam_licenses.sql`

## Cálculo

```text
vagas usadas = quantidade de memberships da congregacao
vagas restantes = seats_total - vagas usadas
```

Uma licença é aceita apenas se:
- `expires_at` é válida e posterior ao momento atual;
- vagas utilizadas são menores que `seats_total`.

## Limite observado

A tabela não contém `max_operators`; o nome atual da quantidade comercial é `seats_total`. A documentação não deve chamar essa coluna de `max_operators` sem uma migration que adicione esse campo.
