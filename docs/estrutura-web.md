# Estrutura web e mapa de rotas

## Raiz de deploy

`web/` e a raiz da aplicacao Next.js. A pasta raiz do repositorio contem documentacao, prototipo legado e testes SQL; ela nao deve ser usada como Root Directory na Vercel.

## Pastas principais

```text
web/
  public/                 assets publicos e branding
  src/
    app/                  rotas Next.js, layouts, APIs e server actions
      (authenticated)/    telas protegidas por sessao
      api/                endpoints HTTP do dominio
      login/              entrada publica
    components/           componentes de interface
    domain/               regras de acesso e dominio
    lib/                  integracoes Supabase, relatorios e apresentacao
    proxy.ts              refresh de sessao Supabase
  supabase/migrations/    migrations PostgreSQL em ordem
  package.json            scripts e dependencias do frontend
  vercel.json             configuracao de build/deploy
```

## Rotas de pagina

| Rota | Funcao | Acesso |
|---|---|---|
| `/login` | Autenticacao | Publico |
| `/` | Dashboard da congregacao ativa | Autenticado |
| `/entradas` | Entradas financeiras | Autenticado |
| `/despesas` | Despesas e aprovacao | Autenticado |
| `/repasses` | Solicitacao e confirmacao de repasses | Autenticado |
| `/caixa` | Caixa fisico | Autenticado |
| `/fechamento` | Fechamento mensal | Autenticado |
| `/ajustes` | Ajustes formais | Autenticado |
| `/estornos` | Estornos formais | Autenticado |
| `/auditoria` | Historico de auditoria | Autenticado |
| `/relatorios` | Prestacao de contas e exportacoes | Autenticado |
| `/configuracoes` | Area reservada para configuracoes | Autenticado |

## Rotas de API

| Endpoint | Operacao |
|---|---|
| `/api/health` | Health check publico do deploy |
| `/api/entries` | Criar entrada |
| `/api/expenses` | Criar despesa |
| `/api/expenses/approve` | Aprovar despesa |
| `/api/transfers` | Solicitar repasse |
| `/api/transfers/approve` | Aprovar repasse |
| `/api/transfers/confirm` | Confirmar ou marcar divergencia |
| `/api/cash/registers` | Criar caixa |
| `/api/cash/periods` | Abrir periodo de caixa |
| `/api/cash/movements` | Registrar movimento de caixa |
| `/api/closing` | Fechar periodo financeiro |
| `/api/adjustments` | Criar ajuste |
| `/api/reversals` | Criar estorno |
| `/api/reports` | Carregar dados do relatorio |

## Regras de caminhos

- Imports internos usam o alias `@/`, configurado em `web/tsconfig.json`.
- Assets publicos devem ficar em `web/public` e ser referenciados a partir de `/`, por exemplo `/branding/ecclesia-finance-logo.png`.
- Chamadas do navegador para APIs usam caminhos absolutos da aplicacao, como `/api/entries`.
- Nao mover `src/app` para a raiz do repositorio: isso quebraria o Root Directory da Vercel.
- Nao colocar `.env.local`, chaves ou conexoes PostgreSQL em `public/`.
- O prototipo legado `index.html`, `app.js` e `styles.css` pertence a raiz do repositorio e nao participa do deploy Next.js quando a Vercel usa `web/` como Root Directory.

## Checklist da Vercel

1. Importar o repositorio.
2. Definir **Root Directory** como `web`.
3. Confirmar framework `Next.js`.
4. Configurar `NEXT_PUBLIC_SUPABASE_URL`.
5. Configurar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Aplicar as migrations no Supabase.
7. Fazer deploy.
8. Abrir `/api/health` e depois `/login`.
9. Validar um login e uma consulta protegida.