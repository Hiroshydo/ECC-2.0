---
title: Canaa Access
module: canaa-access
layer: core
status: parcialmente implementado
tags: [ecc, administracao, acessos, canaa]
---

# Canaã Access

## Propósito

Representar a administração global de unidades, hierarquia e licenças.

No código atual, essa responsabilidade está distribuída entre `/admin`, `AdminManager`, APIs administrativas e a página `/canaa`.

## Status real

### Implementado no código
- `/admin` restrita ao Dev Master.
- Carregamento de contexto com service role server-side.
- Criação e edição de unidades.
- Gestão de usuários e memberships.
- Overrides de permissões.
- Seleção de níveis e pais hierárquicos.
- RPC administrativa `admin_create_congregation`.
- RPC administrativa `admin_replace_user_access`.

### Parcial
- Dependência de segredo server-side.
- `/admin` não valida todas as telas com o mesmo formulário nos testes locais.
- Canaã Access não possui uma nota ou diretório dedicado além da pasta compartilhada `canaa`.

### Não implementar no frontend
`SUPABASE_SERVICE_ROLE_KEY` não pode aparecer em componentes client ou variáveis `NEXT_PUBLIC_*`.

## Arquivos

- `src/app/(authenticated)/admin/page.tsx`
- `src/components/AdminManager.tsx`
- `src/lib/admin/platform.ts`
- `src/lib/admin/types.ts`
- `src/app/api/admin/*`
- migrations `0008`, `0011`, `0012`

## Acoplamentos

- [[Hiram Architecture]] para hierarquia.
- [[Khatam Authenticate]] para licenças da unidade.
- [[Enoch Audit]] para operações administrativas auditadas.
