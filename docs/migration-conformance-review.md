# Revisão de conformidade das migrations — Ecclesia Finance

## Objetivo

Validar se as migrations atuais respeitam o contrato definido em `domain-spec.md` e apontar divergências, lacunas e pendências antes do desenvolvimento de qualquer nova funcionalidade.

Este documento deve ser usado como checklist executável de conformidade do banco.

## Regra de precedência

Quando o código existente divergir do domínio, o código deve ser corrigido. O domínio não deve ser alterado para acomodar uma implementação inadequada.

---

## 1. Critério de avaliação

Cada regra do domínio será classificada em uma destas categorias:

- CONFORME: o banco já atende à regra.
- PARCIAL: existe estrutura, mas falta alguma regra ou comportamento.
- DIVERGENTE: o banco atual contradiz o domínio.
- AUSENTE: o domínio exige algo ainda não implementado.

---

## 2. Matriz de conformidade

| Regra do domínio | Banco atual | Situação |
| --- | --- | --- |
| Repasse separado de despesa | Sim | CONFORME |
| Saldo calculado | Sim | CONFORME |
| Auditoria automática | Sim | CONFORME |
| Auditoria imutável | Verificar | PENDENTE |
| Período fechado bloqueado | Sim | CONFORME |
| Reabertura controlada | Parcial | PARCIAL |
| Ajuste formal | Verificar | PENDENTE |
| Estorno | Verificar | PENDENTE |
| Caixa físico | Verificar | PENDENTE |
| Conciliação de repasse | Parcial | PARCIAL |
| Divergência | Sim | CONFORME |
| Documentos separados | Sim | CONFORME |
| RBAC por congregação | Sim | CONFORME |
| Isolamento por RLS | Sim | CONFORME |
| Idempotência financeira | Verificar | PENDENTE |

---

## 3. Revisão por migration

### 3.1 `0001_finance_core.sql`

#### Objetivo

Representar a estrutura básica do domínio: organização, congregação, usuário, vínculo, papel, entrada, despesa, repasse, período e auditoria.

#### Revisão

| Regra do domínio | Status | Observação |
| --- | --- | --- |
| Organização e congregação | CONFORME | Há `congregations`, `memberships` e `app_role`. |
| Usuário e vínculo | CONFORME | O vínculo é representado por `memberships` com `user_id` e `congregation_id`. |
| Papel | CONFORME | Enum `public.app_role` cobre os papéis definidos no domínio. |
| Entrada | CONFORME | Tabela `entries` corresponde ao conceito financeiro principal. |
| Despesa | CONFORME | Tabela `expenses` representa o fluxo de gasto. |
| Repasse | CONFORME | Tabela `headquarters_transfers` separa os repasses da despesa. |
| Período | PARCIAL | Há `monthly_closings`, mas a lógica de fechamento final ainda precisa ser validada em comportamento real. |
| Auditoria | CONFORME | Existe `audit_events` e o modelo é compatível com append-only. |
| Isolamento por congregação | CONFORME | O uso de `congregation_id` e `is_congregation_member` segue o modelo esperado. |

#### Pontos pendentes

- A auditoria precisa ser verificada quanto à imutabilidade de registros.
- O fechamento não é ainda completamente validado em comportamento operacional.
- O domínio exige regras explícitas para ajuste e reabertura, que não aparecem nesta migration.

### 3.2 `0002_integrity_and_documents.sql`

#### Objetivo

Validar integridade, documentos, comprovantes, fechamento, RLS e isolamento por congregação.

#### Revisão

| Regra do domínio | Status | Observação |
| --- | --- | --- |
| Documentos separados | CONFORME | Existe tabela `documents` com vínculo por entidade e congregação. |
| Comprovantes | CONFORME | O `documents` e `receipt_id` preenchem o requisito. |
| Fechamento de período | CONFORME | Trigger `prevent_closed_period_changes` bloqueia alterações em períodos fechados. |
| RLS por congregação | CONFORME | Há políticas de leitura por congregação e membro. |
| Isolamento por congregação | CONFORME | O padrão de acesso usa `public.is_congregation_member`. |
| Integridade e ajuste | PARCIAL | Há bloqueio de operações em período fechado, mas ainda faltam operações formais de correção e reabertura. |
| Auditoria automática | CONFORME | Trigger `audit_financial_insert` grava evento depois de criação. |
| Reabertura controlada | PARCIAL | Há `monthly_closings` e `period_is_closed`, mas o fluxo de reabertura explícita ainda não está implementado. |

#### Pontos pendentes

- A reabertura precisa ser uma operação explícita, não um `UPDATE` direto.
- O ajuste formal ainda não aparece como operação de domínio e banco.
- O modelo atual ainda não expressa claramente a regra de caixa físico como operação formal.

### 3.3 `0003_financial_cycle_commands.sql`

#### Objetivo

Validar criação, aprovação, repasse, confirmação, divergência, fechamento, `auth.uid()`, permissões e auditoria.

#### Revisão

| Regra do domínio | Status | Observação |
| --- | --- | --- |
| Criação de entrada | CONFORME | RPC `create_entry` faz validação básica e vínculo. |
| Criação de despesa | CONFORME | RPC `create_expense` valida autorização e período. |
| Aprovação de despesa | CONFORME | `approve_expense` verifica status e papel. |
| Solicitação de repasse | CONFORME | `request_transfer` aplica autorização e período. |
| Aprovação de repasse | CONFORME | `approve_transfer` verifica status. |
| Confirmação da sede | CONFORME | `confirm_transfer` verifica divergência e status. |
| Divergência | CONFORME | A função atual marca `questioned` quando há discrepância. |
| Fechamento | CONFORME | `close_monthly_period` existe e grava auditoria. |
| `auth.uid()` | CONFORME | As funções usam `auth.uid()` para derivar o responsável. |
| Permissões por congregação | CONFORME | `has_congregation_role` é usado como guard de autorização. |
| Auditoria | CONFORME | Há gravação de eventos em operações importantes. |
| Reabertura | AUSENTE | Ainda não há operação explícita de reabertura. |
| Ajuste formal | AUSENTE | Não há `correction` ou comando de ajuste formal. |
| Estorno | AUSENTE | Não há comando de estorno explícito. |
| Caixa físico | AUSENTE | Não há operação formal para caixa físico. |
| Idempotência financeira | PENDENTE | Precisa ser verificado em testes concretos. |
| Auditoria imutável | PENDENTE | Requer validação real do banco e do fluxo. |

#### Pontos pendentes

- Não há operação formal de reabertura.
- Não há comando de estorno ou ajuste no banco.
- O domínio exige que alterações em períodos fechados sejam feitas por fluxos específicos; o banco ainda precisa garantir a imutabilidade operacional e a auditoria correta.
- O comportamento de `confirm_transfer` precisa ser testado para divergência e reconciliação.

---

## 4. Testes comportamentais obrigatórios

A partir do domínio, a validação não pode depender de inspeção visual de tabelas. Precisamos testar comportamento real.

### 4.1 Período fechado

Teste obrigatório:

1. Criar movimento em período fechado → deve ser bloqueado.
2. Alterar movimento em período fechado → deve ser bloqueado.
3. Excluir movimento em período fechado → deve ser bloqueado.
4. Estornar movimento em período fechado → deve ser permitido somente pelo fluxo definido.
5. Reabrir período → deve exigir papel autorizado.
6. Reabertura → deve gerar auditoria.

Resultado esperado:

- toda falha deve retornar erro explícito;
- toda operação permitida deve gerar evento de auditoria;
- a transação deve ser atômica.

### 4.2 Divergência de repasse

Teste obrigatório:

1. criar repasse com valor enviado;
2. confirmar com valor recebido diferente;
3. verificar que status passa para `questioned`;
4. verificar que auditoria registra a divergência;
5. verificar que a operação não é tratada como reconciliação normal.

### 4.3 Despesa com aprovação

Teste obrigatório:

1. criar despesa em período aberto;
2. verificar status inicial;
3. verificar que a despesa não pode ser considerada efetivada sem aprovação;
4. chamar `approve_expense` com papel autorizado;
5. verificar auditoria do evento de aprovação;
6. verificar que papel não autorizado é rejeitado.

### 4.4 Regras de autorização

Teste obrigatório:

1. usuário sem vínculo na congregação não pode escrever;
2. usuário com papel `viewer` não pode criar nem aprovar;
3. `central_admin` pode agir em qualquer congregação vinculada;
4. `treasurer` pode operar apenas na congregação correspondente;
5. qualquer tentativa sem autorização deve falhar com erro claro.

### 4.5 Documentação

Teste obrigatório:

1. operação com documento obrigatório sem anexo → bloqueada;
2. operação com documento obrigatório e anexo válido → aceita;
3. operação com comprovante ausente em cargo sensível → rejeitada;
4. operação com documento deve ficar vinculada à entidade correta.

---

## 5. Classificação final

### CONFORME

- repasse separado de despesa;
- saldo calculado;
- auditoria automática;
- divergência;
- documentos separados;
- RBAC por congregação;
- isolamento por RLS;
- período fechado bloqueado.

### PARCIAL

- reabertura controlada;
- conciliação de repasse;
- integridade e bloqueio de período fechado (a funcionalidade existe, mas falta forma explícita de reabertura e ajustes);
- estrutura de período e movimentações financeiras existe, mas ainda precisa ser validada em testes executáveis.

### DIVERGENTE

- nenhuma regra confirmada de divergência entre código e domínio até agora, mas o comportamento precisa ser testado em execução para garantir que a regra é real.

### AUSENTE

- reabertura explícita;
- ajuste formal;
- estorno formal;
- caixa físico como operação de domínio;
- idempotência financeira declarada e verificada;
- auditoria imutável em sentido operacional e de regra de negócio.

---

## 6. Migration 0004 — conclusão da primeira versão

A migration `0004_domain_completion.sql` adiciona, sem modificar `0001`, `0002` ou `0003`:

- `period_reopening_requests`, com solicitação pendente e aprovação separada;
- `financial_adjustments`, com valor assinado, entidade original, motivo e idempotência;
- `financial_reversals`, somente integrais na primeira versão, com unicidade por lançamento;
- `physical_cash_registers`, `physical_cash_periods` e `physical_cash_movements`;
- RLS de leitura por congregação para todas as novas tabelas;
- RPCs com `SECURITY DEFINER`, `search_path = public`, `auth.uid()`, RBAC, locks e auditoria;
- atualização do resumo mensal para incluir ajustes e o impacto reverso dos estornos.

A primeira versão do caixa físico mantém o caixa separado do saldo bancário. Movimentos de caixa são explicitamente tipados como espécie e depósitos/retiradas reduzem o saldo esperado; nenhum movimento bancário é convertido automaticamente em caixa.

Estorno parcial não foi implementado. A operação aceita somente estorno integral e impede uma segunda reversão do mesmo lançamento.

## 7. Conclusão

A base atual já apresenta uma arquitetura promissora e alinhada em muitas regras fundamentais, mas a revisão de conformidade deve ser feita com foco em comportamento real, não apenas em presença de tabelas, enums e RPCs.

O domínio define o padrão e a implementação deve obedecer a ele. O que ainda não está provado em testes e em regras explícitas precisa ser tratado como pendência antes de qualquer nova tela ou nova funcionalidade.

O próximo passo é:

`domain-spec.md`
↓
Auditoria das migrations
↓
Correção das divergências
↓
Testes de regras
↓
Validação de RLS
↓
Validação das RPCs
↓
Só então telas funcionais

Este documento deve ser revisado antes de seguir com qualquer mudança no código.
