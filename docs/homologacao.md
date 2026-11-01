# Desenvolvimento local

## Objetivo

O app roda localmente com Next.js e Supabase em Docker. O banco da nuvem fica fora do fluxo de desenvolvimento; não use `supabase link`, `db push` ou comandos remotos.

## Pré-requisitos e inicialização

Instale Docker e Node.js 20.9 ou superior e confirme que o Docker está em execução e pode ser usado pelo usuário sem `sudo`.

```bash
cd web
npm ci
npm run local:up
npm run local:reset
npm run jordao -- use local
npm run dev
```

O comando `npm run jordao -- use local` gera/atualiza `.env.local` a partir do Supabase local ativo e cria um segredo de sessão local se necessário. Ele preserva as demais variáveis já configuradas e não consulta nem configura projetos de nuvem.

O Studio local está em <http://127.0.0.1:54323>. Convites de teste ficam no Mailpit/Inbucket cujo endereço é informado por `npm run local:status` (normalmente <http://127.0.0.1:54324>).

## Usuário demonstrativo local

O seed cria, apenas para homologacao:

```text
E-mail: teste@teste
Senha: teste
```

Essas credenciais são intencionalmente fracas e exclusivas do ambiente local. O seed é `LOCAL ONLY — nunca aplicar na nuvem`.

## Dados incluídos

O arquivo `web/supabase/seed.sql` cria de forma idempotente:

- quatro congregacoes;
- um usuario com papel `central_admin` nas quatro congregacoes;
- entradas de dizimos e ofertas;
- despesas aprovadas e pendentes;
- repasses confirmados e aguardando confirmacao;
- um caixa fisico com entrada e saida;
- fechamentos mensais abertos;
- dados suficientes para dashboard, relatorios, auditoria, ajustes e navegacao.

## Fluxo diário e validação

Use `npm run local:status` para confirmar que os serviços locais estão ativos. Acesse <http://localhost:3000/login>, entre com o usuário demonstrativo e valide o app. `npm run local:reset` apaga e recria o banco local, aplica todas as migrations e carrega novamente o seed.

A migração local → nuvem será documentada e implementada no módulo Jordão. Até lá, não conecte nem aplique migrations a qualquer projeto de nuvem.
