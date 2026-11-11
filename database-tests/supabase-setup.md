# Supabase local e testes

Este fluxo usa o projeto local definido em `web/supabase/config.toml`. Os comandos abaixo não precisam de credenciais cloud e não devem receber a flag `--remote`.

## Pré-requisitos

- Docker em execução e acessível pelo usuário atual;
- Supabase CLI;
- acesso ao container local do PostgreSQL para a suíte de banco.

Se Docker responder `permission denied`, atualize a sessão do usuário após conceder acesso apropriado ao daemon. Não altere as permissões do socket com `chmod 666`.

## Iniciar e aplicar migrations

Na raiz do repositório:

```bash
cd web
supabase start
supabase status
supabase migration list
supabase db push
```

O CLI usa o stack local quando executado em `web/`; confirme que o destino exibido é `local stack` antes de aplicar. O repositório contém migrations de `0001_finance_core.sql` até `0013_khatam_licenses.sql`.

Para recriar o banco local, aplicar todas as migrations e carregar o seed:

```bash
supabase db reset
```

**Atenção:** `db reset` apaga todos os dados do banco local. Não use em um projeto remoto ou de produção. O seed cria dados e o usuário demonstrativo `teste@teste`; as credenciais fracas são exclusivas de desenvolvimento/homologação.

## Executar a suíte

Na raiz do repositório, rode a suíte usando o `psql` do container:

```bash
SUPABASE_LOCAL_CONTAINER=supabase_db_web bash database-tests/run_suite.sh
```

O nome padrão corresponde a `project_id = "web"` em `web/supabase/config.toml`; para outro projeto local, informe o nome do container ativo. Como alternativa, instale `psql` no host e configure `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` e `PGDATABASE` ou `DATABASE_URL` no ambiente do processo. Não cole credenciais no código nem as salve em arquivos versionados.

O runner cria fixtures persistentes, por isso use somente o banco local de desenvolvimento. O resultado `DOMAIN STATUS: PASS` confirma que os cinco scripts executaram suas assertions; não significa que cenários ausentes da suíte, como concorrência entre conexões, foram validados.

## Verificar a aplicação local

Em `web/.env.local`, configure:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave-publicavel-local>
```

Obtenha a chave com `supabase status` dentro de `web/`; não use a chave ou a URL de produção. Na raiz:

```bash
npm --prefix web run dev
```

Abra `http://localhost:3000`. O seed deve ser carregado antes de usar a conta demonstrativa.

## Banco remoto

`supabase db push --remote` e `supabase migration list --remote` acessam um banco remoto. Antes de usá-los, confirme o projeto de destino, faça backup e verifique o histórico de migrations. Não execute a suíte de fixtures em produção.
