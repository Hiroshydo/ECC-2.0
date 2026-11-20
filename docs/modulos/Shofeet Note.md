---
title: Shofeet Note
module: shofeet
layer: plugin
status: planejado
tags: [ecc, plugin, fiscal, nota, sped, itg2002, shofeet]
---

# Shofeet Note

<img src="../assets/branding/Modulos/2_Badges_Com_Nome_Interno/03-shofeet-note.svg" alt="Shofeet Note" width="220">

| Aspecto | Detalhe |
|---|---|
| Status Real | **Planejado / adiado** |
| Camada | Plug-in fiscal |
| Rotas | Nenhuma |
| Tabelas/RPCs | Nenhuma implementação ativa |
| Arquivos principais | `src/modules/plugins/shofeet/README.md` |

## Propósito

Plug-in fiscal planejado para integrar notas fiscais, XML, certificados A1 e padrões contábeis sem acoplar essas regras ao núcleo financeiro.

## Estado

**Planejado / adiado no roadmap atual.**

Não há emissão fiscal, certificado, storage fiscal ou integração contábil implementada no código.

## Arquitetura futura

```mermaid
flowchart LR
    ECC["Ecclesia Core"] --> Staging["Staging fiscal"]
    Staging --> NFe["NF-e"]
    Staging --> NFCe["NFC-e"]
    Staging --> NFSe["NFS-e"]
    NFe --> XML["XML assinado"]
    NFCe --> XML
    NFSe --> XML
    XML --> Archive["Arquivo / retenção"]
    Archive --> ITG["ITG 2002"]
    ITG --> SPED["SPED"]
```

## Capacidades futuras

- NF-e, NFC-e e NFS-e.
- Upload e validação de XML.
- Certificado A1 protegido por cofre.
- Controle de imunidade tributária e natureza da operação.
- Plano de contas compatível com ITG 2002.
- Exportações e validações SPED.
- Associações entre documento fiscal e lançamento financeiro.

## Acoplamentos futuros

- [[Ecclesia Core]]
- [[Enoch Audit]]
- [[Sefer Reports]]
- [[Gideon Security]]
