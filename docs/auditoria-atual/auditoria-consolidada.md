# Auditoria de Continuidade — Ecclesia Finance

## 1. Cronograma de 31 tópicos

O documento `Ecclesia_Finance_Plano_Evolucao_Completo.pdf`, citado no pedido de auditoria, não está presente no workspace. Portanto, a lista dos 31 tópicos abaixo foi recebida como referência externa desta execução e não pôde ser confrontada diretamente com o PDF original.

Os tópicos informados são:

01. Objetivo do projeto
02. Estrutura organizacional
03. Dois modelos de congregação
04. CNPJ
05. Contas financeiras
06. Meios de recebimento
07. Entradas
08. Despesas
09. Caixa físico
10. Abertura e fechamento do Caixa
11. Pix
12. Débito
13. Maquininha
14. Extrato da maquininha
15. Arrecadação
16. Conciliação
17. Fluxo centralizado
18. Repasses
19. Confirmação da sede
20. Formas de repasse da sede
21. Governança financeira
22. Perfis de acesso
23. Dashboard da sede
24. Dashboard da congregação
25. Ajustes e Estornos
26. Auditoria
27. Pendências
28. Período financeiro
29. Relatórios e prestação de contas
30. Configurações
31. Banco de dados

## 2. O que já havia sido auditado

Os relatórios e documentos existentes indicam auditoria anterior dos seguintes assuntos:

- autenticação e sessão;
- memberships e congregações;
- isolamento entre congregações;
- RBAC;
- frontend;
- páginas, componentes e navegação;
- APIs;
- Server Actions;
- migrations;
- RPCs;
- RLS;
- entradas;
- despesas;
- repasses;
- fechamento;
- ajustes;
- estornos;
- caixa físico;
- auditoria;
- relatórios;
- matriz de operações;
- contrato de implementação;
- status do escopo.

As referências encontradas foram principalmente:

- `docs/domain-spec.md`;
- `docs/domain-test-plan.md`;
- `docs/migration-conformance-review.md`;
- `database-tests/README.md`;
- `database-tests/00_domain_suite.sql`;
- `database-tests/01_test_seed.sql`;
- `database-tests/02_security_rls.sql`;
- `database-tests/03_financial_flow.sql`;
- `database-tests/04_domain_completion.sql`;
- `database-tests/run_suite.sh`;
- `RESULTADO_FINAL.md`;
- `STATUS_REVISÃO_0004.md`;
- `REVIEW_0004_ANALYSIS.md`;
- `CRITICAL_EDGE_CASES_VALIDATION.md`;
- `RELATÓRIO_FINAL_0004.md`.

A auditoria anterior registrou, entre outros, o achado de que `approved -> sent` em repasses não possui operação real da aplicação. Esse achado foi reutilizado nesta matriz e não foi refeito.

## 3. Cruzamento entre domínio e auditoria

A numeração dos 31 tópicos não coincide com a numeração da auditoria anterior. O cruzamento foi feito pelo assunto, não pelo número.

A classificação “já auditado” significa que o assunto foi analisado anteriormente, não que a funcionalidade esteja conforme ou completa.

## 4. Lacunas encontradas

As lacunas mais relevantes identificadas pelo cruzamento foram:

- ausência de evidência do PDF original no workspace;
- ausência de modelo de organização acima de congregação;
- ausência de dois modelos de congregação;
- ausência de CNPJ;
- ausência de contas financeiras;
- meios de recebimento modelados apenas como texto;
- ausência de Pix operacional;
- ausência de débito operacional;
- ausência de maquininha;
- ausência de extrato de maquininha;
- ausência de conciliação financeira geral;
- ausência de fluxo centralizado real da sede;
- ausência de formas de repasse da sede;
- governança apenas parcialmente representada por roles;
- dashboard de sede não implementado na aplicação Next.js;
- dashboard da congregação parcialmente implementado;
- pendências não modeladas como entidade ou fluxo;
- configurações sem implementação;
- validação runtime do banco bloqueada sem conexão real.

## 5. Auditoria das lacunas

### 5.1 Organização, congregações e identificadores

O banco possui `congregations` e `memberships`, mas não possui tabela ou coluna de organização superior, `organization_id`, CNPJ ou modelo explícito para dois tipos de congregação.

Evidência: `web/supabase/migrations/0001_finance_core.sql` cria `congregations` com `id`, `name`, `city`, `active`, sem organização superior ou CNPJ.

Classificação: **NOT IMPLEMENTED** para organização superior, CNPJ e modelos distintos de congregação.

### 5.2 Contas financeiras e meios de recebimento

`entries` possui `payment_method text`, e o TypeScript define `cash`, `pix`, `transfer`, `card`, `check` e `other`.

Não existem tabelas de contas financeiras, contas bancárias, carteiras, adquirentes ou fontes de recebimento. Não existe vínculo de uma entrada a uma conta financeira.

Classificação: **PARTIAL** para meios de recebimento e **NOT IMPLEMENTED** para contas financeiras.

### 5.3 Pix, débito, maquininha e extrato

`pix` e `card` aparecem apenas como valores de `payment_method` no frontend e nos tipos TypeScript.

Não foram encontradas:

- tabelas de transações Pix;
- chaves Pix;
- webhooks;
- conciliação Pix;
- transações de débito;
- adquirentes;
- maquininhas;
- taxas;
- parcelas;
- liquidação;
- extrato de maquininha;
- APIs ou RPCs dessas áreas;
- testes específicos.

Classificação: **NOT IMPLEMENTED** para Pix operacional, débito, maquininha e extrato de maquininha.

### 5.4 Arrecadação e conciliação

O sistema soma entradas por período na view `congregation_monthly_summary`. Não existe entidade de arrecadação, lote de arrecadação, conferência ou conciliação geral.

A documentação de testes trata apenas de conciliação de repasse, e a RPC `confirm_transfer` compara `amount_sent_cents` com `amount_received_cents`.

Classificação: **PARTIAL** para cálculo de arrecadação e **PARTIAL** para conciliação de repasses; **NOT IMPLEMENTED** para conciliação financeira geral.

### 5.5 Fluxo centralizado e sede

A tabela `headquarters_transfers` representa repasses com destino textual. Não existe organização central, conta da sede ou visão de múltiplas congregações autorizadas por uma relação organizacional.

O teste seed cria uma congregação chamada `Sede`, mas isso é fixture, não um modelo de sede global.

O dashboard Next.js consulta somente a congregação ativa selecionada pelo usuário.

Classificação: **PARTIAL** para representação de sede por congregação; **NOT IMPLEMENTED** para fluxo centralizado real e dashboard agregado da sede.

### 5.6 Formas de repasse da sede

Não foram encontrados tipos, tabelas, campos ou RPCs para forma de repasse, transferência bancária, Pix da sede, depósito ou método de envio. O repasse possui destino, valores, datas e motivo, mas não forma de envio.

Classificação: **NOT IMPLEMENTED**.

### 5.7 Governança financeira

Há roles `central_admin`, `congregation_admin`, `treasurer`, `auditor` e `viewer`, arrays de roles em RPCs e matriz de permissões no TypeScript.

Não existe tabela de políticas de governança, alçadas, limites, dupla aprovação configurável, organização, cargo por operação ou configuração de aprovação.

Classificação: **PARTIAL**.

### 5.8 Dashboards

O dashboard da congregação existe em `web/src/app/(authenticated)/page.tsx` e consulta o resumo mensal, entradas, despesas, repasses e registros sem comprovante.

O protótipo estático `index.html` apresenta uma visão de sede com números fixos e interações simuladas em `app.js`, mas não é conectado ao Supabase.

Não existe dashboard Next.js agregado de sede com múltiplas congregações.

Classificação: **PARTIAL** para dashboard da congregação e **NOT IMPLEMENTED** para dashboard real da sede.

### 5.9 Pendências

O dashboard calcula quantidade de registros sem `receipt_id` e quantidade de repasses `sent`. Isso é uma consulta pontual, não uma entidade ou workflow de pendência.

Não existe tabela `pending_items`, fila, responsável, prazo, resolução ou auditoria de pendência.

Classificação: **PARTIAL**.

### 5.10 Configurações

A página `web/src/app/(authenticated)/configuracoes/page.tsx` renderiza `ModulePage` com a descrição de que configurações serão disponibilizadas futuramente.

Não existem APIs, RPCs, tabelas ou formulários de configuração financeira.

Classificação: **NOT IMPLEMENTED**.

### 5.11 Banco de dados

O tópico possui implementação estrutural nas migrations 0001–0006, incluindo tabelas, enums, índices, constraints, views, triggers, funções, grants e RLS.

A execução contra banco real não foi realizada nesta auditoria.

Classificação: **PARTIAL** e **BLOCKED — REQUER EXECUÇÃO** para comportamento runtime.

## 6. Problemas encontrados

### CRITICAL

Nenhum novo problema foi classificado como CRITICAL nesta execução.

### HIGH

- Não existe modelo de organização superior ou isolamento entre organizações.
- Contas financeiras, Pix, débito, maquininha e liquidação não existem como fluxo operacional.
- O fluxo centralizado da sede não existe como modelo executável.
- Pendências são inferidas por consultas e não possuem ciclo de vida.
- O dashboard estático de sede usa dados fixos e não representa o produto conectado.

### MEDIUM

- Meios de recebimento são texto livre sem cadastro ou configuração.
- Governança é representada apenas por roles e arrays fixos.
- Configurações possuem apenas página placeholder.
- Arrecadação é derivada de entradas, sem entidade própria.
- Conciliação está restrita ao repasse.
- Não existem testes para os tópicos financeiros novos.
- PDF do plano original não está presente no workspace.

### LOW

- `card` é usado como meio genérico, sem distinção entre crédito e débito.
- `other` permite meio de pagamento sem semântica específica.
- O protótipo estático e a aplicação Next.js coexistem sem indicação documental de precedência.

## 7. Funcionalidades implementadas

Com evidência de código ou SQL:

- congregações;
- memberships;
- roles básicos;
- entradas;
- despesas;
- repasses;
- confirmação de repasses;
- caixa físico em parte do fluxo;
- fechamento mensal;
- ajustes;
- estornos integrais;
- auditoria de operações existentes;
- dashboard de uma congregação;
- relatórios financeiros e exportação PDF/Excel;
- configuração Supabase e migrations SQL.

## 8. Funcionalidades parciais

- estrutura organizacional;
- meios de recebimento;
- arrecadação;
- conciliação de repasses;
- fluxo centralizado;
- governança financeira;
- perfis de acesso;
- dashboard da congregação;
- pendências;
- período financeiro;
- relatórios e prestação;
- caixa físico;
- auditoria;
- banco de dados.

## 9. Funcionalidades com falha

- matriz de operação do domínio contradiz estados efetivos do banco;
- dashboard estático de sede apresenta dados simulados fora do fluxo Supabase;
- relatório atribui operações ao usuário que consulta, não necessariamente ao executor;
- estado `sent` aparece na interface sem operação que o produza;
- documentação anterior afirma conformidade mais ampla que a evidenciada pelo código atual.

## 10. Funcionalidades não implementadas

- dois modelos de congregação;
- CNPJ;
- contas financeiras;
- Pix operacional;
- débito operacional;
- maquininha;
- extrato de maquininha;
- conciliação financeira geral;
- formas de repasse da sede;
- dashboard real da sede;
- entidade de pendências;
- configurações funcionais;
- documentos e comprovantes operacionais;
- estados completos de entradas, despesas e fechamento;
- APIs de reabertura e fechamento/contagem de caixa;
- fluxo de envio de repasse.

## 11. Pontos bloqueados

- O PDF `Ecclesia_Finance_Plano_Evolucao_Completo.pdf` não está presente.
- Não há conexão PostgreSQL/Supabase disponível nesta auditoria.
- Não houve execução da suíte `database-tests/run_suite.sh`.
- Não foi possível confirmar privilégios efetivos, RLS runtime, Storage ou dados reais.

## 12. Pontos não comprovados

- se existe ambiente externo com tabelas ou RPCs adicionais não versionadas;
- se há dados reais de Pix, débito ou maquininha fora do workspace;
- se a sede possui configuração externa não representada no código;
- se o protótipo estático ainda é utilizado operacionalmente;
- se as conclusões históricas das Etapas 1–15 estão integralmente preservadas em algum arquivo não versionado.

## 13. Divergências domínio × banco

- o domínio dos 31 tópicos exige CNPJ e contas financeiras, mas o banco não possui essas entidades;
- Pix, débito e maquininha aparecem como conceitos do plano, mas não como tipos ou tabelas SQL;
- o domínio exige documentos configuráveis, mas `documents` não participa da criação financeira;
- o domínio possui estados de entrada e despesas que não existem nas tabelas;
- o domínio exige pendências, mas o banco não possui entidade de pendência;
- a organização superior não existe no modelo relacional atual.

## 14. Divergências domínio × API

- não existem APIs para Pix, débito, maquininha, extrato, conciliação geral, governança ou configurações;
- não existe API de sede agregada;
- não existem APIs de documentos;
- o endpoint de relatórios é financeiro genérico, não um conjunto de relatórios por tópico;
- as APIs financeiras não validam schema runtime completo.

## 15. Divergências domínio × frontend

- a tela de configurações é placeholder;
- o dashboard da congregação não é dashboard da sede;
- o protótipo estático apresenta visão de sede desconectada dos dados reais;
- Pix e cartão aparecem somente como opções de seleção;
- não há tela de contas financeiras, conciliação, maquininha, extrato ou governança;
- pendências são exibidas apenas como contadores derivados.

## 16. Divergências domínio × testes

Não existem testes específicos para:

- CNPJ;
- contas financeiras;
- Pix;
- débito;
- maquininha;
- extrato de maquininha;
- arrecadação;
- conciliação financeira geral;
- fluxo centralizado;
- formas de repasse;
- governança;
- dashboard de sede ou congregação;
- pendências;
- configurações.

Os testes existentes são predominantemente SQL/RPC e não comprovam a cadeia completa frontend → API → RPC → banco.

## 17. Divergências de segurança

- não há camada de organização superior para avaliar isolamento entre organizações;
- `central_admin` é tratado como membership por congregação, não como autoridade global;
- não há alçadas configuráveis ou dupla aprovação modelada;
- dados de pagamento não possuem entidades próprias para isolamento e auditoria;
- a validação de RLS e privilégios depende de execução real não realizada;
- funções `SECURITY DEFINER` e grants foram inspecionados estaticamente, não comprovados em ambiente aplicado.

## 18. Divergências de auditoria

- entradas registram apenas texto de método de pagamento, sem detalhes de origem transacional Pix/cartão;
- não existe auditoria de conciliação geral, liquidação de maquininha ou pendências;
- não há auditoria de configurações;
- o responsável exibido nos relatórios pode não ser o ator da operação;
- divergência de repasse é registrada com ação `confirmed` e reason específico.

## 19. Divergências de relatórios

- não há relatório de Pix, débito ou maquininha;
- não há extrato de recebimentos;
- não há conciliação financeira geral;
- não há relatório de pendências como entidade rastreável;
- não há relatório de sede agregado por organização;
- o relatório financeiro existente usa dados detalhados, mas não implementa todos os agrupamentos exigidos pelo domínio;
- o dashboard estático de sede não é fonte oficial do banco.

## 20. Matriz final dos 31 tópicos

| Nº | Tópico do domínio | Auditoria anterior | Nova investigação | Implementação | Status final | Evidência |
|---:|---|---|---|---|---|---|
| 01 | Objetivo do projeto | Sim | Não necessária | README e domínio descrevem objetivo | PASS | `README.md`, `docs/domain-spec.md` |
| 02 | Estrutura organizacional | Parcial | Sim | Congregações e memberships; sem organização superior | PARTIAL | `0001_finance_core.sql` |
| 03 | Dois modelos de congregação | Não comprovado | Sim | Nenhum modelo ou campo de tipo encontrado | NOT IMPLEMENTED | busca em `web/src` e `web/supabase` |
| 04 | CNPJ | Não comprovado | Sim | Nenhuma coluna, tabela ou validação CNPJ | NOT IMPLEMENTED | busca por `cnpj` sem resultado funcional |
| 05 | Contas financeiras | Não comprovado | Sim | Nenhuma tabela de contas financeiras | NOT IMPLEMENTED | migrations 0001–0006 |
| 06 | Meios de recebimento | Parcial | Sim | `payment_method` textual e opções frontend | PARTIAL | `finance.ts`, `EntryManager.tsx`, `0001` |
| 07 | Entradas | Sim | Não repetida | RPC, API, página, auditoria e testes existentes | PARTIAL | `create_entry`, `/api/entries`, `03_financial_flow.sql` |
| 08 | Despesas | Sim | Não repetida | Criação/aprovação implementadas; estados incompletos | PARTIAL | `create_expense`, `approve_expense` |
| 09 | Caixa físico | Sim | Não repetida | Banco/RPC e abertura/movimentos frontend; contagem/fechamento sem produto | PARTIAL | `0004`, `0005`, `0006`, `CashManager.tsx` |
| 10 | Abertura e fechamento do Caixa | Sim | Nova checagem de lacuna | Abertura existe; RPCs de contagem/fechamento sem API/interface | PARTIAL | `open_cash_period`, `count_cash`, `close_cash_period` |
| 11 | Pix | Não comprovado | Sim | Apenas valor textual de `payment_method` | NOT IMPLEMENTED | `finance.ts`, `0001` |
| 12 | Débito | Não comprovado | Sim | Nenhum fluxo específico | NOT IMPLEMENTED | busca sem `debit` funcional |
| 13 | Maquininha | Não comprovado | Sim | Nenhum modelo, API ou RPC | NOT IMPLEMENTED | busca sem `machine` funcional |
| 14 | Extrato da maquininha | Não comprovado | Sim | Nenhum extrato ou tabela | NOT IMPLEMENTED | `web/supabase/migrations` |
| 15 | Arrecadação | Parcial | Sim | Soma de `entries` no resumo mensal | PARTIAL | `congregation_monthly_summary` |
| 16 | Conciliação | Parcial | Sim | Conciliação de repasse; sem conciliação geral | PARTIAL | `confirm_transfer`, `domain-test-plan.md` |
| 17 | Fluxo centralizado | Parcial | Sim | `headquarters_transfers` e fixture Sede; sem organização central | PARTIAL | `0001`, `03_financial_flow.sql` |
| 18 | Repasses | Sim | Não repetida | Solicitação/aprovação/confirmação; `sent` sem operação | FAIL | `TransferManager.tsx`, `0003` |
| 19 | Confirmação da sede | Sim | Não repetida | RPC confirma por role `central_admin` | PARTIAL | `confirm_transfer` |
| 20 | Formas de repasse da sede | Não comprovado | Sim | Nenhum campo/tipo de forma de envio | NOT IMPLEMENTED | migrations e API de transfers |
| 21 | Governança financeira | Parcial | Sim | Roles fixos; sem alçadas/configuração | PARTIAL | `access.ts`, `0002`, `0003` |
| 22 | Perfis de acesso | Sim | Não repetida | Roles e permissões frontend; duplicação e divergência | PARTIAL | `access.ts`, `Sidebar.tsx` |
| 23 | Dashboard da sede | Não comprovado | Sim | Protótipo estático fixo; sem dashboard Next.js agregado | NOT IMPLEMENTED | `index.html`, `app.js`, dashboard Next.js |
| 24 | Dashboard da congregação | Parcial | Sim | Dashboard real por congregação ativa | PARTIAL | `authenticated/page.tsx` |
| 25 | Ajustes e Estornos | Sim | Não repetida | RPC/API/frontend e testes SQL; fluxo de estados incompleto | PARTIAL | `0004`, `CorrectionManager.tsx` |
| 26 | Auditoria | Sim | Nova checagem de lacuna | Audit events existentes; documentos/configurações não cobertos | PARTIAL | `audit_events`, `AuditLog.tsx` |
| 27 | Pendências | Parcial | Sim | Contadores de comprovante e repasses; sem entidade/workflow | PARTIAL | `authenticated/page.tsx` |
| 28 | Período financeiro | Sim | Não repetida | Fechamento, bloqueio e reabertura SQL; produto incompleto | PARTIAL | `0002`, `0003`, `0004` |
| 29 | Relatórios e prestação de contas | Sim | Não repetida | Relatório financeiro PDF/Excel; cobertura incompleta | PARTIAL | `ReportSummary.tsx`, `reports/data.ts` |
| 30 | Configurações | Não comprovado | Sim | Página placeholder sem persistência | NOT IMPLEMENTED | `configuracoes/page.tsx` |
| 31 | Banco de dados | Sim | Nova checagem de lacuna | Migrations, RLS, RPCs e testes existem; runtime bloqueado | BLOCKED | `web/supabase`, `database-tests/run_suite.sh` |

## 21. Estado separado do futuro

### Estado atual encontrado

O produto atual possui um núcleo financeiro baseado em congregação, com entradas, despesas, repasses, fechamento mensal, ajustes, estornos, caixa físico parcial, auditoria, RLS e relatórios financeiros.

### Capacidades não evidenciadas no estado atual

Não foram encontradas implementações operacionais para Pix, débito, maquininha, extrato de maquininha, contas financeiras, CNPJ, organização superior, formas de repasse da sede, dashboard real de sede, configurações ou pendências como workflow.

Esses itens permanecem como requisitos declarados ou tópicos do plano, não como funcionalidades comprovadamente disponíveis.

## 22. Conclusão da auditoria

Os 31 tópicos foram checados contra a documentação disponível, código, migrations, RPCs, RLS, APIs, frontend, relatórios e testes existentes.

A auditoria anterior foi reutilizada para os tópicos já cobertos, especialmente entradas, despesas, caixa, repasses, confirmação, ajustes, estornos, auditoria, perfis, períodos e relatórios. As novas investigações concentraram-se nos tópicos sem evidência suficiente e nas lacunas específicas de Pix, débito, maquininha, contas, CNPJ, governança, pendências, sede, configurações e conciliação.

O PDF original não foi encontrado, portanto a correspondência documental entre o plano de 31 tópicos e o arquivo original está **NÃO COMPROVADA**. A matriz desta auditoria usa a lista fornecida nesta execução como referência de domínio.

```text
AUDITORIA CONSOLIDADA CONCLUÍDA

31 TÓPICOS DO DOMÍNIO ANALISADOS/CHECADOS

TÓPICOS JÁ COBERTOS PELA AUDITORIA ANTERIOR: 18
TÓPICOS COM NOVA INVESTIGAÇÃO: 13

PASS: 1
PARTIAL: 18
FAIL: 1
NOT IMPLEMENTED: 10
BLOCKED: 1
NÃO COMPROVADO: pontos documentais e runtime

DOCUMENTO:
docs/auditoria-atual/auditoria-consolidada.md
```
