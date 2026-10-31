# Ambiente de homologacao

## Objetivo

A homologacao e um ambiente separado para clientes conhecerem o Ecclesia Finance com dados demonstrativos. Ela nao deve compartilhar banco, usuarios ou credenciais com Production.

## Projetos

- **Vercel Production:** `ecclesia-finance`
- **Vercel Homologacao:** `ecclesia-finance-a8cp`
- **Supabase homologacao recomendado:** projeto separado do projeto de producao
- **Project ref atualmente identificado:** `qkezodddzzitpswtuekg`

> O project ref identificado nao deve ser usado como homologacao sem confirmar no painel que ele nao e o banco de producao.

## Usuario demonstrativo

O seed cria, apenas para homologacao:

```text
E-mail: teste@teste
Senha: teste
```

Essas credenciais sao intencionalmente fracas e nunca podem ser usadas em Production. Depois da demonstracao, o usuario deve ser removido ou a senha deve ser trocada.

## Dados incluidos

O arquivo `web/supabase/seed.sql` cria de forma idempotente:

- quatro congregacoes;
- um usuario com papel `central_admin` nas quatro congregacoes;
- entradas de dizimos e ofertas;
- despesas aprovadas e pendentes;
- repasses confirmados e aguardando confirmacao;
- um caixa fisico com entrada e saida;
- fechamentos mensais abertos;
- dados suficientes para dashboard, relatorios, auditoria, ajustes e navegacao.

## Execucao local

Com Docker e Supabase CLI instalados:

```powershell
cd web
npx supabase start
npx supabase db reset
```

O `db reset` aplica as migrations e o `seed.sql` configurado em `supabase/config.toml`.

## Execucao em Supabase cloud de homologacao

O `seed.sql` nao e aplicado automaticamente por `supabase db push`. Para cloud:

1. Crie ou confirme um projeto Supabase exclusivo de homologacao.
2. Aplique as migrations `0001` a `0007`.
3. Execute o conteudo de `web/supabase/seed.sql` no SQL Editor autenticado como administrador, ou use um pipeline protegido.
4. Nunca execute esse seed no banco de producao.
5. Confirme no painel Auth que `teste@teste` foi criado e esta confirmado.

## Vercel

No projeto `ecclesia-finance-a8cp`:

- Root Directory: `web`;
- Framework: Next.js;
- `NEXT_PUBLIC_SUPABASE_URL`: URL do Supabase de homologacao;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publica do Supabase de homologacao.

Configure as variaveis em `Preview` e `Development`. Nao coloque `service_role`, senha do banco ou `DATABASE_URL` na Vercel frontend.

## Validacao do cliente

1. Abrir a URL Preview da Vercel.
2. Acessar `/login`.
3. Entrar com `teste@teste` e `teste`.
4. Alternar entre as quatro congregacoes.
5. Conferir dashboard, entradas, despesas, repasses, caixa, fechamento, ajustes, estornos, auditoria e relatorios.
6. Testar uma operacao de escrita apenas no banco de homologacao.
7. Confirmar que nenhum dado aparece no projeto Production.

## Estado atual

O seed foi criado no repositorio, mas a aplicacao cloud ainda nao foi populada porque o acesso Supabase nao foi concluido nesta sessao. O deploy sem banco exibe a pre-visualizacao publica; o login e os dados demonstrativos exigem as variaveis do Supabase de homologacao.
