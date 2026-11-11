# Ecclesia Finance Web

Aplicação Next.js do Ecclesia Finance. Execute os comandos deste arquivo a partir da raiz do repositório, salvo indicação contrária.

## Desenvolvimento local

Pré-requisitos: Node.js/npm, Docker em execução e Supabase CLI. A suíte também pode usar o `psql` que já existe no container local.

1. Inicie o Supabase local e aplique as migrations pendentes:

   ```bash
   cd web
   supabase start
   supabase db push
   ```

   `db push` sem `--remote` usa o projeto local configurado em `web/supabase/config.toml`.

2. Configure `web/.env.local` com os valores locais do Supabase. Obtenha a chave publicável local com `supabase status`; não use chaves de produção:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave-publicavel-local>
   ```

3. Na raiz do repositório, instale dependências e inicie a aplicação:

   ```bash
   npm --prefix web ci
   npm --prefix web run dev
   ```

   A aplicação fica disponível em `http://localhost:3000`.

Para recriar o banco local e carregar o seed demonstrativo:

```bash
cd web
supabase db reset
```

**Atenção:** `db reset` apaga os dados do banco local, reaplica as migrations e carrega `supabase/seed.sql`. Nunca use esse comando em um banco remoto. O seed e as credenciais de demonstração são apenas para desenvolvimento/homologação.

## Testes

Na raiz do repositório, execute:

```bash
SUPABASE_LOCAL_CONTAINER=supabase_db_web bash database-tests/run_suite.sh
```

O comando cria registros de fixture no banco de teste. Use um banco local descartável; detalhes e interpretação estão em [database-tests/README.md](../database-tests/README.md).

## Publicação na Vercel

Configure `web` como **Root Directory** e use as migrations de `supabase/migrations/0001` a `0013`, em ordem, no projeto Supabase de destino.

Em **Settings > Environment Variables**, configure:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Para habilitar a administração global, configure `SUPABASE_SERVICE_ROLE_KEY` como segredo server-side e `PLATFORM_ADMIN_USER_IDS` como lista de UUIDs autorizados. A service role nunca deve usar o prefixo `NEXT_PUBLIC_` nem ser enviada ao navegador. Não execute `supabase/seed.sql` em produção.

Valide `https://SEU-DOMINIO/api/health`: `status: ok` confirma a presença das variáveis, mas não substitui testes de login, migrations, RLS ou conectividade.
