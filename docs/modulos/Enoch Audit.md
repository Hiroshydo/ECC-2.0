---
title: Enoch Audit
module: enoch
layer: core
status: implementado no codigo
tags: [ecc, auditoria, trilha, enoch]
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
