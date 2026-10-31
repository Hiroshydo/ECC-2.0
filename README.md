<p align="center">
  <img src="web/public/branding/ecclesia-finance-logo.png" alt="Ecclesia Finance" width="360">
</p>

<h1 align="center">Ecclesia Finance</h1>

<p align="center">Organização, transparência e confiança para a gestão financeira de igrejas e organizações.</p>

## 🏛️ Sobre o Ecclesia Finance

O Ecclesia Finance foi desenvolvido para ajudar igrejas e organizações a controlar suas finanças, acompanhar movimentações e apresentar uma prestação de contas clara, organizada e compreensível.

## 📌 Status atual

O núcleo financeiro e as telas principais estão implementados e o aplicativo passa por lint e build de produção. A suíte de domínio ainda precisa ser executada contra um PostgreSQL/Supabase configurado; sem essa execução, o status correto do banco é `BLOCKED`, não `PASS`.

As migrations devem ser aplicadas em ordem até `0007_performance_indexes.sql`. Recursos como dashboard agregado da sede, contas financeiras, Pix operacional, maquininha, governança configurável e configurações administrativas permanecem fora do núcleo implementado.

O ambiente separado de homologação está publicado em `https://ecclesia-finance-a8cp.vercel.app`. O seed demonstrativo e os passos para conectar um Supabase exclusivo de homologação estão em [docs/homologacao.md](docs/homologacao.md).

## Publicação na Vercel

No projeto da Vercel, use `web` como **Root Directory**. A configuração versionada em `web/vercel.json` define Next.js, `npm ci` e `npm run build`.

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nos ambientes `Preview` e `Production` da Vercel. Salve as variaveis, crie um novo deploy e valide `https://SEU-DOMINIO/api/health`: `status: ok` confirma a presenca das variaveis, mas nao substitui os testes de login e banco.

O mapa de pastas e rotas está documentado em [docs/estrutura-web.md](docs/estrutura-web.md).

## 🎯 Objetivo

Reunir em um só lugar as informações financeiras da organização, fortalecendo a organização, a transparência, o controle e a responsabilidade na prestação de contas.

## 📊 Dashboard

Uma visão geral do período financeiro, com:

- entradas;
- despesas;
- repasses;
- ajustes;
- saldo;
- situações que precisam de atenção.

## 💰 Entradas

Registre os valores recebidos pela congregação e acompanhe data, categoria, origem, forma de recebimento e finalidade.

## 💳 Despesas

Registre e acompanhe os gastos da organização, com categoria, descrição, fornecedor, forma de pagamento, finalidade, centro de custo e situação de aprovação.

## 🔄 Repasses

Acompanhe o fluxo de repasses entre congregações e a administração, desde a solicitação e aprovação até o envio e a confirmação do recebimento.

## 💵 Caixa

Controle o dinheiro físico da congregação, incluindo abertura do caixa, entradas, saídas, depósitos, movimentações e saldo físico atual.

## 🔒 Fechamento

Encerre o período financeiro com clareza e consolide os registros que compõem a prestação de contas.

## 🛠️ Ajustes

Registre correções financeiras de forma controlada, justificada e transparente, preservando a compreensão do histórico.

## ↩️ Estornos

Registre reversões de lançamentos quando necessário, mantendo a integridade e a rastreabilidade das informações.

## 🔎 Auditoria

Consulte o histórico das principais ações realizadas no sistema. A auditoria ajuda a acompanhar mudanças, responsabilidades e decisões com transparência.

## 📑 Relatórios

Gere uma prestação de contas clara e organizada para visualização, apresentação e arquivamento.

Os relatórios reúnem:

- resumo financeiro;
- entradas;
- despesas;
- repasses;
- ajustes;
- estornos;
- movimentações de caixa;
- fechamento;
- auditoria.

A prestação pode ser visualizada e baixada em PDF ou Excel, com informações organizadas para reuniões, acompanhamento e arquivamento.

## ⚙️ Configurações

Concentra as opções administrativas disponíveis para a organização.

## 🧭 Como funciona

1. Acesse sua congregação.
2. Registre entradas e despesas.
3. Controle o caixa físico.
4. Registre e acompanhe repasses.
5. Faça ajustes ou estornos quando necessário.
6. Acompanhe a auditoria.
7. Feche o período.
8. Gere a prestação de contas.

## 📋 Prestação de contas

O Ecclesia Finance transforma os registros financeiros do período em uma visão clara, organizada e compreensível para apresentação, acompanhamento e arquivamento.

## 💻 Tecnologia

- Next.js
- TypeScript
- Supabase

## 🌱 Projeto

O Ecclesia Finance nasce com um propósito simples: apoiar igrejas e organizações na construção de uma gestão financeira mais organizada, transparente e responsável.

Mais do que registrar números, o sistema ajuda a contar a história financeira de cada período com clareza e confiança.
