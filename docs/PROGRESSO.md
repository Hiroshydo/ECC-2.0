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
