---
title: Noah Ops
module: noah
layer: core
status: parcialmente implementado
tags: [ecc, core, noah, observabilidade]
---

# Noah Developer / Noah Ops

| Status Real | Camada | Rotas | Tabelas / RPCs | Arquivos principais |
|---|---|---|---|---|
| Parcialmente implementado | Core / console Dev Master | `/noah-ops` | Nenhuma integração de telemetria persistente | `src/app/(authenticated)/noah-ops/page.tsx`, `NoahTelemetryGrid.tsx`, `ModuleArchitectureMap.tsx` |

## Implementado

- A rota exige usuário autenticado e `isMasterAdmin`.
- Mostra cartões de telemetria com estados predefinidos como `unknown`.
- Exibe o mapa de dependências dos módulos do ECC.
- Marca Gideon e Shofeet como futuros.

## Não implementado

O dashboard de saúde não coleta métricas dinâmicas de latência, banco, disponibilidade ou filas. A presença de um cartão ou nó no mapa não significa integração operacional.

## Acoplamentos

- [Canaã Access & Local](Cana%C3%A3%20Access%20%26%20Local.md) — governança global de unidades.
- [Hiram Architecture](Hiram%20Architecture.md) — arquitetura e hierarquia.
- [Gideon Security](Gideon%20Security.md) e [Shofeet Note](Shofeet%20Note.md) — plug-ins futuros.
- [Noah Developer](Noah%20Developer.md) — nome histórico da identidade.
