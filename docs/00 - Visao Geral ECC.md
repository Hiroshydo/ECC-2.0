---
title: Visao Geral ECC
module: ecclesia
layer: core
status: parcialmente implementado
tags:
  - ecc
  - arquitetura
  - nextjs
  - supabase
---

# Visão Geral — Ecclesia Finance ECC 2.0

## Identidade do produto

O ECC 2.0 é um ERP financeiro multi-tenant e hierárquico voltado à gestão financeira de **igrejas** e **ONGs/associações**. A aplicação usa Next.js 16 App Router, React 19, TypeScript, Tailwind CSS e Supabase/PostgreSQL.

A configuração organizacional aceita `church` ou `ong` e altera os termos apresentados pela tela. A implementação está em [[Hiram Architecture]] e [vocabulary.ts](../web/src/domain/vocabulary.ts).

## Monólito Modular

```mermaid
flowchart LR
    subgraph UI["Interface Next.js"]
        Auth["Login"]
        Shell["Layout Autenticado"]
        Pages["Páginas"]
        Managers["Componentes Manager"]
    end

    subgraph DOMAIN["Domínio"]
        Access["RBAC / overrides"]
        Finance["Tipos financeiros"]
        Vocabulary["Vocabulário"]
    end

    subgraph CORE["Core"]
        Ecclesia["Ecclesia Core"]
        Hiram["Hiram Architecture"]
        Elias["Elias Temp"]
        Enoch["Enoch Audit"]
        Sefer["Sefer Reports"]
        Khatam["Khatam Authenticate"]
        Canaa["Canaã"]
    end

    subgraph DATA["Dados"]
        Supabase["Supabase Auth"]
        RLS["RLS / RPC"]
        PG["PostgreSQL"]
    end

    Auth --> Shell
    Shell --> Pages
    Pages --> Managers
    Managers --> DOMAIN
    DOMAIN --> RLS
    RLS --> PG
    Supabase --> Shell
    Core --> RLS
```

## Componentes reais

| Camada | Conteúdo real |
|---|---|
| Presentação | `src/app`, `src/components` |
| Domínio | `src/domain/access.ts`, `finance.ts`, `vocabulary.ts`, `audit.ts` |
| Aplicação | Server Components, Server Actions e API Routes |
| Integração | `src/lib/supabase`, `src/lib/admin`, `src/lib/reports` |
| Banco | migrations 0001 a 0013 |

## Fluxo de dados

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as Proxy Next.js
    participant L as Layout SSR
    participant C as Componente Manager
    participant A as API / Server Action
    participant R as RPC PostgreSQL
    participant D as PostgreSQL RLS
    participant Q as Auditoria / Relatório

    U->>P: Solicita rota protegida
    P->>L: Atualiza sessão
    L->>D: Consulta memberships e unidade ativa
    D-->>L: Papéis e permissões
    L-->>C: Renderiza contexto autorizado
    U->>C: Envia operação
    C->>A: POST
    A->>R: RPC com parâmetros
    R->>D: Valida RBAC, período e RLS
    D-->>Q: Atualiza dados e auditoria
    Q-->>C: Resultado
```

## Autenticação e contexto

- `src/proxy.ts` protege todas as rotas correspondentes ao matcher.
- `/login` e `/api/health` são públicos.
- `src/lib/supabase/middleware.ts` cria o cliente SSR e recupera o usuário.
- `src/app/(authenticated)/layout.tsx` obtém memberships e define a unidade ativa pelo cookie `active_congregation_id`.
- `CongregationSwitcher` permite trocar a unidade ativa.
- O Dev Master é identificado por metadata ou pelo e-mail temporariamente definido como fallback em `isMasterAdmin`.

## Estados reais da implementação

### Implementado no código

- Login e sessão.
- Unidade ativa e troca de unidade.
- Dashboard mensal e hierarquia financeira.
- Entradas, despesas, repasses, caixa, fechamento, ajustes e estornos.
- Auditoria por unidade.
- Relatórios PDF e Excel.
- Administração global de unidades e acessos.
- RLS, RBAC, overrides, idempotência e migrations.
- Licenças básicas Khatam.

### Parcialmente implementado

- Cadastro completo da equipe Canaã.
- Telemetria real Noah Ops.
- Reabertura formal e fluxo de caixa físico na interface.
- Modelo administrativo global depende de `SUPABASE_SERVICE_ROLE_KEY`.
- O convite Canaã depende de licença e configuração server-side.

### Planejado / adiado

- [[Gideon Security]]: Pix mTLS/DICT, defesa de borda, nonce e WORM.
- [[Shofeet Note]]: NF-e/NFC-e/NFS-e, XML, certificado A1 e ITG 2002/SPED.

## Mapa de documentação

- [[Ecclesia Core]]
- [[Hiram Architecture]]
- [[Elias Temp]]
- [[Enoch Audit]]
- [[Sefer Reports]]
- [[Khatam Authenticate]]
- [[Canaa Local]]
- [[Canaa Access]]
- [[Noah Developer]]
- [[Gideon Security]]
- [[Shofeet Note]]
