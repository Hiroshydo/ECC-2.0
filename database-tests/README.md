# Suíte de testes de banco

A suíte valida o contrato de domínio em PostgreSQL/Supabase usando fixtures e assertions SQL. Execute-a somente em um banco local descartável: os scripts criam usuários, memberships e movimentações de teste.

## Pré-requisitos

- Supabase local iniciado com Docker;
- migrations `0001` a `0013` aplicadas;
- acesso ao container local do PostgreSQL (o `psql` do container pode ser usado diretamente);
- acesso de banco que possa criar fixtures em `auth.users` (no Supabase local, use o usuário `postgres`).

Consulte [supabase-setup.md](supabase-setup.md) para preparar o ambiente local. Não use a URL, senha ou credenciais de produção.

## Executar

Na raiz do repositório:

```bash
SUPABASE_LOCAL_CONTAINER=supabase_db_web bash database-tests/run_suite.sh
```

O nome padrão corresponde a `project_id = "web"` em `web/supabase/config.toml`. Para outro ambiente, informe o nome do container ativo. Também é possível usar `psql` instalado no host configurando `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` e `PGDATABASE`.

Também é possível fornecer `DATABASE_URL` no ambiente. Não salve credenciais em arquivos versionados.

## Scripts executados

O runner executa os SQLs nesta ordem:

1. `01_test_seed.sql` — cria fixtures isoladas;
2. `02_security_rls.sql` — testa RLS e permissões;
3. `03_financial_flow.sql` — testa entradas, despesas, repasses e auditoria;
4. `04_domain_completion.sql` — testa reabertura, ajustes, estornos e caixa físico;
5. `00_domain_suite.sql` — confirma isolamento agregado como `authenticated`.

O runner informa `PASS` por arquivo e `DOMAIN STATUS: PASS` somente se todos terminarem sem erro. Esse resumo não declara automaticamente que cenários ausentes, como concorrência entre conexões, foram testados.

## Interpretação

- `PASS`: o script executou suas assertions no banco;
- `FAIL`: uma assertion ou operação SQL falhou; o runner identifica o arquivo;
- `BLOCKED`: conexão, contexto autenticado ou infraestrutura não permitiu executar a suíte.

Um `RAISE NOTICE`, parse válido ou existência de tabela não é suficiente para passar: cada script deve realizar as verificações definidas nele.

## Dados e segurança

Os scripts fazem `COMMIT`; fixtures e movimentos permanecem no banco local após a execução. Para começar de uma base limpa, use `supabase db reset` dentro de `web/`. Esse comando apaga os dados locais e carrega o seed de demonstração. Nunca o execute em um projeto remoto ou de produção.
