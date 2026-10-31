# Ecclesia Finance Web

## Desenvolvimento local

O desenvolvimento usa Next.js e Supabase local via Docker. Requisitos: Node.js 20.9 ou superior e Docker em execução com acesso pelo usuário atual.

```bash
cd web
npm ci
npm run local:up
npm run local:reset
npm run jordao -- use local
npm run dev
```

O Supabase Studio fica em <http://127.0.0.1:54323>. E-mails locais de convite são capturados pelo Mailpit (endereço exibido em `npm run local:status`, normalmente <http://127.0.0.1:54324>). O seed local habilita o login demonstrativo documentado em `supabase/seed.sql`.

O comando `jordao use local` será implementado na Parte 6. Até lá, obtenha os valores pelo comando `npx supabase status -o env`: `API_URL` é `NEXT_PUBLIC_SUPABASE_URL`; use `PUBLISHABLE_KEY` (ou `ANON_KEY`) para `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; use `SECRET_KEY` (ou `SERVICE_ROLE_KEY`) para `SUPABASE_SERVICE_ROLE_KEY`. Grave-os somente em `.env.local`, que não deve ser versionado.

Comandos úteis:

- `npm run local:up`: inicia os serviços locais;
- `npm run local:down`: encerra os serviços locais;
- `npm run local:reset`: recria o banco, reaplica migrations e carrega o seed local;
- `npm run local:status`: exibe portas, URLs e chaves do ambiente local;
- `npm run db:types`: gera os tipos TypeScript a partir do banco local ativo.

Nunca use o seed local nem comandos de reset contra um projeto de nuvem.
