This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Deploy na Vercel

Configure o projeto Vercel com `web` como **Root Directory** e framework **Next.js**. O arquivo `vercel.json` define `npm ci` e `npm run build`.

Em **Settings > Environment Variables**, configure em `Production` e `Preview`:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publica do projeto Supabase.

Para habilitar a administracao global, configure tambem `SUPABASE_SERVICE_ROLE_KEY` como segredo server-side (sem prefixo `NEXT_PUBLIC_`) e `PLATFORM_ADMIN_USER_IDS` como lista separada por virgulas de UUIDs de usuarios autorizados. O endpoint `/api/admin/*` valida o usuario autenticado contra essa allowlist; a service role nunca e enviada ao navegador. Aplique a migration `0008_organization_admin_permissions.sql` antes do deploy que habilita o painel.

Salve as variaveis e crie um novo deploy para que sejam aplicadas no build e na execucao. Nao configure `SUPABASE_SERVICE_ROLE_KEY`, senha do banco ou `DATABASE_URL` no frontend; credenciais administrativas nunca devem usar o prefixo `NEXT_PUBLIC_`.

## Supabase

No projeto Supabase de destino, aplique em ordem as migrations `supabase/migrations/0001` a `0007`. Em **Authentication > URL Configuration**, configure como **Site URL** o dominio canonico da Vercel e adicione somente os dominios Vercel usados em **Redirect URLs**.

Nao execute o seed demonstrativo em producao. Crie usuarios e memberships de producao por um fluxo administrativo seguro.

## Verificacao

Acesse `https://SEU-DOMINIO/api/health`. `status: ok` confirma que as duas variaveis estao presentes no deploy, mas nao substitui a validacao de login, migrations, RLS ou conectividade com o banco. Sem as variaveis, a rota retorna `503` e as areas financeiras ficam inacessiveis.

## Getting Started

O trabalho de desenvolvimento e publicacao deve ocorrer por pull request e deploy da Vercel. A aplicacao nao depende de um servidor local para operar.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
