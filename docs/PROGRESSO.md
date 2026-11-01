# Progresso da execução local

## Parte 1 — Supabase local

Status: concluída.

- Configurado o projeto Supabase local `ecc-local` e adicionados comandos npm para iniciar, parar, resetar, consultar e gerar tipos.
- Criados modelos separados para os perfis local e de nuvem; os arquivos locais com chaves estão ignorados pelo Git.
- Atualizadas as instruções de desenvolvimento e homologação para usar Docker e o Supabase local. `npm run jordao -- use local` gera o `.env.local` ignorado pelo Git, preserva variáveis extras e não consulta projetos de nuvem.
- Limitados os testes SQL ao banco local por padrão, com execução pelo container quando o cliente `psql` não estiver instalado no host.
- Gerados os tipos TypeScript do schema local e aplicada a tipagem somente ao cliente Supabase de serviço. A tipagem dos demais clientes foi adiada porque revelou incompatibilidades existentes em várias consultas do app.
- A migration `0013_khatam_licenses.sql` já existia nesta branch e foi aplicada somente no banco local pelo reset; nenhuma migration foi criada nesta parte.

### Validação

- Reset local: concluído, migrations `0001` a `0013` e seed aplicados.
- O seed concede `app_metadata.role = central_admin` somente à conta demonstrativa local `teste@teste`.
- Backup `ecc_producao_local.dump`: restauração isolada validada e importação aplicada no banco local, preservando o esquema migrado. Foram carregados 9 usuários, 5 congregações, 17 vínculos, 9 entradas e 8 despesas; a tabela Khatam da migration `0013` permanece sem dados do backup.
- Studio local: respondeu em `127.0.0.1:54323`.
- Mailpit local: respondeu em `127.0.0.1:54324`.
- Suíte `database-tests/run_suite.sh`: passou; autenticação, RLS, RBAC, auditoria, fluxos financeiros e demais asserções reportaram `PASS`.
- `npm run lint`: passou.
- `npm run build`: passou.
- Login demonstrativo, `/api/health`, páginas financeiras/admin/Noah Ops e `/api/admin/overview`: responderam com sucesso no servidor local.

Nenhuma migration foi aplicada à nuvem. O relatório do `npm install` indicou vulnerabilidades na árvore de dependências; não foi executado `npm audit fix`.

## Canaã Access redesign

### Parte 0 — Levantamento

Status: concluída; sem alterações de código.

- Canaã Access: `src/app/(authenticated)/admin/page.tsx` (`AdminPage`) monta `DevConsole`; a aba Access renderiza `src/components/AdminManager.tsx` (`AdminManager`). Os cartões de unidade são renderizados inline como `.organization-card`.
- Canaã Local: `src/app/(authenticated)/canaa/page.tsx` (`CanaaPage`).
- O mapa reutilizado pelas duas telas está em `src/modules/core/canaa/components/CongregationFlowMap.tsx` (`FlowMapContent`/`layoutNodes`); seus nós estão em `CongregationNode.tsx` (`CongregationNode`). A equipe local está em `LocalTeamManager.tsx` (`LocalTeamManager`).
- As Server Actions existentes são `linkParentAction` e `inviteOperatorAction` em `modules/core/canaa/actions/canaa.actions.ts`. Criação/edição de unidades e acessos estão atualmente em Route Handlers sob `app/api/admin/congregations/`; configuração de licença está em `app/api/admin/congregations/[id]/license/route.ts`.
- `getLicense` está em `modules/core/khatam/services/license.service.ts`; `checkSeat` em `license.shared.ts`. A tabela legada é definida por `0013_khatam_licenses.sql`; os campos denormalizados e estado/cota da licença foram acrescentados em `0014_congregation_khatam_license_fields.sql`. A Parte 0 não criou nem aplicou migrations.
- O RPC `public.has_congregation_permission(uuid, text)` valida associação em `memberships` e overrides; a camada Next usa `can(membership, permission)` de `domain/access.ts`. Não existe permissão de administração de unidades dedicada: `hierarchy.view` é leitura; `financial.write` é a permissão de escrita hoje usada pelo convite local; `isMasterAdmin` protege o Console Dev.
- O esquema usa `congregations.parent_id`, `organization_type` (`church`/`ngo`) e `organization_level`; não existe conceito de região. A relação de operadores é `public.memberships`, sem tabela `congregation_memberships`.
- Guias locais do Next.js 16 lidos antes da implementação: Server Actions/Mutations, Segurança de Dados, Server e Client Components. Toda action/consulta deve validar entrada e autorização no servidor; DAL com `server-only` mantém leitura e autorização fora do cliente.

### Parte 1 — Camada de dados paginada

Status: concluída; sem alterações em dados financeiros, RLS ou permissões.

- Criado `modules/core/canaa/services/units.service.ts`, uma DAL `server-only` para listagem paginada, detalhe de unidade e resumo de saúde da rede. A listagem aplica busca/filtros/ordenação no PostgreSQL e `LIMIT/OFFSET`; as respostas de saúde são agregadas no servidor.
- Criadas as rotas `GET /api/admin/units` e `GET /api/admin/units/[id]`. A visão global exige `isMasterAdmin`; a leitura restrita exige associação à raiz e `hierarchy.view`. Essa permissão é usada apenas para leitura, nunca como permissão de escrita.
- Quando as colunas da migration `0014` não existem, a DAL lê o schema legado de `khatam_licenses`; se a tabela não estiver instalada, expõe disponibilidade da licença como indisponível, sem fabricar zero/cota/status.
- Criados `license.classification.ts` e `units.filters.ts`, com classificação consistente, validação de filtros e limites de paginação; operadores ativos excluem contas excluídas do Auth.
- Criada migration local `0015_units_directory_indexes.sql` com índice de memberships por unidade e cargo. Não foi aplicada a nenhum banco.
- Adicionado Vitest e scripts `typecheck`/`test` ao pacote `web`. O repositório não tinha runner de testes declarado.
- ASSUNÇÕES registradas no código: página padrão 25; `MAX_PAGE_SIZE=100`; busca a partir de 2 caracteres e limitada a 100; janela de saúde de vencimento de 30 dias. A classificação visual individual de licença continua usando a janela de 7 dias já especificada.
- Validação desta parte: `npm run typecheck`, `npm run lint` e `npm run test` passaram (8 testes). As rotas/consultas ainda não foram exercitadas contra um banco de integração; nenhuma migration foi aplicada.
