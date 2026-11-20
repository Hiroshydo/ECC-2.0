---
title: Telemetria & Contas Ao Vivo
module: ecc-live-telemetry
layer: core
status: dinamico
tags: [ecc, core, telemetry, supabase]
---

# Telemetria & Contas Ao Vivo

<span class="ecc-status ecc-status-planned">🔵 OFFLINE</span>  Atualizado: 20/11/2026, 00:38:10

> Supabase indisponível: URL ou chave de leitura não configurada.

## Contas & unidades cadastradas — Hiram

| Unidade | Natureza | Nível hierárquico | Vínculo de matriz (`parent_id`) | Status |
|---|---|---|---|---|
| Sem unidades disponíveis | — | — | — | — |

## Licenças & cotas — Khatam

Licenças indisponíveis enquanto a conexão/permissão não for restabelecida.
## Últimos eventos — Enoch Audit

| Data/hora | Ação | Unidade |
|---|---|---|
| Sem eventos visíveis | — | — |

## Precisão do schema

- A tabela `khatam_licenses` armazena `seats_total` e `expires_at`; `seats_total` é apresentado como limite de assentos (equivalente operacional ao `max_operators`, não nome literal de coluna).
- O schema atual não registra início nem duração do ciclo de 30 dias. A contagem exibida é de dias até `expires_at`; não é possível inferir o ciclo comercial de 30 dias com os campos existentes.
- Os registros de auditoria reais estão em `audit_events` (não `audit_logs`). Por privacidade, esta nota exibe apenas data/hora, ação e unidade; não inclui ator, motivo, payload ou UUIDs.
- Em modo anon/publishable, RLS pode limitar os dados visíveis. Uma consulta vazia não garante que não existam registros.

> Esta nota é gerada localmente pelo sincronizador. Nenhuma URL/chave/token é gravada no Markdown.
