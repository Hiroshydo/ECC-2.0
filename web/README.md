# Ecclesia Finance Web

## Desenvolvimento local

O desenvolvimento usa Next.js e Supabase local via Docker. Requisitos: Node.js 20.9 ou superior e Docker em execução com acesso pelo usuário atual.

```bash
cd web
npm ci
npm run local:up
npm run local:reset
npm run local:restore -- --confirm-local-overwrite
npm run jordao -- use local
npm run dev
```

`npm run jordao -- use local` gera/atualiza `.env.local` com as URLs e chaves do Supabase local, as conexões PostgreSQL e um segredo de sessão local. O comando só funciona com os serviços locais ativos; ele não consulta nem configura projetos de nuvem.

`npm run local:restore -- --confirm-local-overwrite` importa `../ecc_producao_local.dump` no banco local já migrado, substituindo usuários e dados de demonstração pelos dados do backup. O comando exige confirmação explícita, valida que o Supabase ativo é o local e nunca conecta à nuvem. As senhas não podem ser lidas do backup; os hashes são preservados para autenticação local.

O Supabase Studio fica em <http://127.0.0.1:54323>. E-mails locais de convite são capturados pelo Mailpit (endereço exibido em `npm run local:status`, normalmente <http://127.0.0.1:54324>). `npm run local:reset` usa a conta de demonstração documentada em `supabase/seed.sql`; depois da restauração do backup, use a senha original da conta, que não pode ser recuperada a partir do hash.

Comandos úteis:

- `npm run local:up`: inicia os serviços locais;
- `npm run local:down`: encerra os serviços locais;
- `npm run local:reset`: recria o banco, reaplica migrations e carrega o seed local;
- `npm run local:status`: exibe portas, URLs e chaves do ambiente local;
- `npm run db:types`: gera os tipos TypeScript a partir do banco local ativo.

Nunca use o seed local nem comandos de reset contra um projeto de nuvem.
