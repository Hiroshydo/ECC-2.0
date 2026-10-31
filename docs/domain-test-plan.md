# Plano de testes executáveis do domínio — Ecclesia Finance

## Objetivo

Transformar o `domain-spec.md` em uma suíte de testes do domínio focada em comportamento real, não em existência de tabelas ou funções.

A suíte deve validar:

- segurança;
- integridade financeira;
- permissões;
- auditoria;
- fechamento;
- repasses;
- saldos;
- idempotência;
- reabertura;
- ajustes e estornos;
- caixa físico.

A regra principal é:

- se o comportamento não estiver validado, não é considerado implementado;
- se houver divergência entre domínio e banco, o banco deve ser corrigido;
- nenhuma nova tela ou funcionalidade deve ser criada sem passar por esses testes.

---

## 1. Estrutura da suíte

```text
domain-spec.md
↓
migration-conformance-review.md
↓
database-tests
↓
RPC tests
↓
RLS tests
↓
security tests
↓
UI
```

A ordem de execução deve seguir o contrato do produto e a prioridade de risco.

---

## 2. Prioridade 1 — Segurança

### 2.1 Usuário sem sessão não executa RPC financeira

- Cenário: usuário anônimo tenta chamar `create_entry`, `create_expense`, `request_transfer`, `approve_expense` ou `close_monthly_period`.
- Resultado esperado: falha explícita de autenticação.
- Status: obrigatório.

### 2.2 Usuário da Congregação A não acessa Congregação B

- Cenário: usuário vinculado a `congregation_a` tenta ler ou escrever em `congregation_b`.
- Resultado esperado: acesso negado por RLS ou validação de congregação.
- Status: obrigatório.

### 2.3 Usuário sem permissão não cria lançamento

- Cenário: `viewer` ou usuário sem vínculo tenta registrar entrada, despesa ou repasse.
- Resultado esperado: erro de permissão.
- Status: obrigatório.

### 2.4 Tesoureiro não aprova operação quando não possui essa permissão

- Cenário: `treasurer` tenta aprovar despesa ou transfer.
- Resultado esperado: falha por `financial_approve`/papel inadequado.
- Status: obrigatório.

### 2.5 Auditor não altera financeiro

- Cenário: `auditor` tenta criar, alterar ou fechar dados financeiros.
- Resultado esperado: bloqueado.
- Status: obrigatório.

### 2.6 Visualizador não altera financeiro

- Cenário: `viewer` tenta registrar movimento ou aprovar.
- Resultado esperado: bloqueado.
- Status: obrigatório.

### 2.7 Usuário não consegue informar outro `auth.uid()`

- Cenário: operação tenta forçar `recorded_by`, `requested_by` ou `actor_id` com valor de outro usuário.
- Resultado esperado: rejeitado; o sistema deriva o responsável da sessão autenticada.
- Status: obrigatório.

---

## 3. Prioridade 2 — Entradas

### 3.1 Entrada válida

- Cenário: usuário autorizado cria entrada com valor positivo, categoria válida e congregação correta.
- Resultado esperado: entrada registrada com auditoria.
- Status: obrigatório.

### 3.2 Valor zero

- Cenário: entrada com `amount_cents = 0`.
- Resultado esperado: rejeitada.
- Status: obrigatório.

### 3.3 Valor negativo

- Cenário: entrada com valor negativo.
- Resultado esperado: rejeitada.
- Status: obrigatório.

### 3.4 Congregação inexistente

- Cenário: operação referencia congregação sem existir.
- Resultado esperado: rejeitada.
- Status: obrigatório.

### 3.5 Congregação sem vínculo

- Cenário: usuário não vinculado tenta operar em congregação inexistente ou fora do vínculo.
- Resultado esperado: rejeitada.
- Status: obrigatório.

### 3.6 Período fechado

- Cenário: entrada criada em período fechado.
- Resultado esperado: bloqueada.
- Status: obrigatório.

### 3.7 Categoria inválida

- Cenário: categoria fora do enum ou fora da regra de negócio.
- Resultado esperado: rejeitada.
- Status: obrigatório.

### 3.8 Auditoria criada automaticamente

- Cenário: entrada criada com sucesso.
- Resultado esperado: registro em `audit_events` com `action = 'created'` e dados antes/depois adequados.
- Status: obrigatório.

### 3.9 Usuário responsável derivado da sessão

- Cenário: chamada RPC em nome de usuário autenticado.
- Resultado esperado: `recorded_by` ou equivalente é `auth.uid()`; não pode ser passado pelo cliente.
- Status: obrigatório.

---

## 4. Prioridade 3 — Despesas

### 4.1 Criação

- Cenário: despesa válida criada por usuário autorizado.
- Resultado esperado: `status` inicial conforme regra e auditoria de criação.
- Status: obrigatório.

### 4.2 Aprovação

- Cenário: despesa pendente é aprovada por papel autorizado.
- Resultado esperado: status `approved`, `approved_by` e `approved_at` preenchidos.
- Status: obrigatório.

### 4.3 Reprovação

- Cenário: se o domínio definir `rejected`, o teste deve validar este estado.
- Resultado esperado: operação rejeitada com auditoria e motivo.
- Status: condicional ao domínio.

### 4.4 Efetivação

- Cenário: despesa aprovada passa para status efetivado ou pago conforme regra.
- Resultado esperado: estado final válido e registrado.
- Status: obrigatório.

### 4.5 Comprovante obrigatório quando aplicável

- Cenário: despesa que exige documento sem comprovante.
- Resultado esperado: bloqueada.
- Status: obrigatório quando a regra de domínio exigir documento.

### 4.6 Tentativa de aprovação sem permissão

- Cenário: usuário sem papel apropriado tenta aprovar.
- Resultado esperado: falha.
- Status: obrigatório.

### 4.7 Alteração depois do fechamento

- Cenário: despesa alterada após encerramento do período.
- Resultado esperado: bloqueada.
- Status: obrigatório.

### 4.8 Auditoria de cada mudança

- Cenário: despesa criada, aprovada, rejeitada ou alterada.
- Resultado esperado: evento de auditoria para cada transição.
- Status: obrigatório.

---

## 5. Prioridade 4 — Repasses

### Cenário base 1: conciliação positiva

- Congregação solicita repasse de R$ 5.000.
- Administrador aprova.
- Congregação registra envio.
- Sede confirma R$ 5.000.
- Resultado esperado: `CONCILIADO`.

### Cenário base 2: divergência

- Congregação registra envio de R$ 5.000.
- Sede confirma R$ 4.800.
- Resultado esperado: `DIVERGÊNCIA`.
- A diferença deve aparecer no histórico.

### Critérios de validação

- status promocional correto: `requested` -> `approved` -> `sent` -> `confirmed` ou `questioned`;
- evento de auditoria para aprovação e confirmação;
- divergência deve ser persistente em histórico e visível para operação;
- valor recebido não pode substituir silenciosamente o valor enviado;
- operação não pode ser tratada como reconciliação normal quando houver diferença.

---

## 6. Prioridade 5 — Saldo

### Massa de teste

Saldo inicial: R$ 1.000

Entradas: R$ 5.000
Despesas: R$ 1.500
Repasses: R$ 2.000
Ajustes: R$ 100

Cálculo esperado:

$$
1.000 + 5.000 - 1.500 - 2.000 + 100 = 2.600
$$

Resultado esperado: saldo final = R$ 2.600.

### Testes obrigatórios

- saldo inicial correto;
- somatório de entradas correto;
- somatório de despesas correto;
- repasses descontados corretamente;
- ajustes aplicados corretamente;
- saldo recalculado após estorno;
- estorno deve reverter impacto de forma explícita e auditada.

---

## 7. Prioridade 6 — Fechamento

### Fluxo de validação

1. Período aberto.
2. Movimentos permitidos.
3. Há pendências.
4. Fechamento bloqueado.
5. Resolver pendências.
6. Fechamento permitido.
7. Nova tentativa de alteração → bloqueada.

### Resultados esperados

- somente status válido pode ser usado;
- o fechamento não pode ocorrer com pendências abertas sem regra autorizada;
- a tentativa de alteração em período fechado deve falhar;
- operação de reabertura deve ser explícita; não pode ser `UPDATE` simples;
- fechamento gera auditoria.

---

## 8. Prioridade 7 — Auditoria

### Testes obrigatórios

- cada operação cria evento;
- `UPDATE` em `audit_events` é negado;
- `DELETE` em `audit_events` é negado;
- política de auditoria é aplicada por banco e não apenas por convenção;
- o registro deve preservar `actor_id`, `congregation_id`, `before`, `after`, `reason` e `occurred_at`.

### Resultado esperado

- auditoria não pode ser apenas uma tabela com intenção de imutabilidade;
- deve ser tecnicamente protegida com RLS/trigger/política de escrita restrita.

---

## 9. Prioridade 8 — Idempotência

### Cenário obrigatório

Enviar duas vezes a mesma operação.

### Resultado esperado

- um único movimento efetivado;
- segunda requisição é rejeitada ou tratada como operação duplicada;
- o banco deve impedir duplo processamento por timeout, retry, duplo clique ou perda de resposta.

### O que precisa ser protegido

- compra duplicada;
- criação repetida de mesma despesa;
- envio duplicado de repasse;
- aprovação duplicada;
- confirmação duplicada.

---

## 10. Prioridade 9 — Reabertura

Hoje está pendente no domínio e no banco.

### Regras a fixar antes da implementação

- quem solicita;
- quem aprova;
- motivo obrigatório;
- estado anterior;
- estado posterior;
- prazo de reabertura, se houver;
- nova conferência obrigatória;
- nova auditoria.

### Fluxo proposto

```text
FECHADO
→ REABERTURA SOLICITADA
→ REABERTO
→ EM CONFERÊNCIA
→ FECHADO
```

### Regras de controle

- reabertura não pode ser apenas `UPDATE` no fechamento;
- deve existir comando explícito de reabertura;
- deve registrar motivo, responsável, antes/depois e auditoria;
- deve exigir autorização de papel correto.

---

## 11. Prioridade 10 — Ajuste e estorno

### Separação obrigatória

- ajuste corrige uma diferença financeira sem alterar o lançamento original;
- estorno reverte uma operação existente;
- ajuste e estorno não devem ser a mesma operação.

### Exemplo de ajuste

- entrada original: R$ 1.000
- erro encontrado: R$ 100
- ajuste: -R$ 100
- resultado: o lançamento original permanece intacto, mas o saldo final reflita a correção.

### Exemplo de estorno

- operação original registrada;
- estorno explícito reaproveita a operação e a reverte de forma auditada.

### Regras

- ajuste e estorno exigem motivo obrigatório;
- o histórico original deve permanecer intacto;
- toda mudança deve ser registrada em auditoria;
- a reversão deve ser tratada em fluxo específico e não como exclusão silenciosa.

---

## 12. Prioridade 11 — Caixa físico

### Regras esperadas

- saldo esperado;
- contagem física;
- diferença;
- motivo;
- responsável;
- conferente;
- auditoria.

### Exemplo

- esperado: R$ 2.000;
- contado: R$ 1.950;
- diferença: R$ 50;
- resultado: registrar a ocorrência, não alterar silenciosamente o saldo para R$ 1.950.

### Regras de implementação

- caixa físico nunca deve substituir o sistema financeiro principal;
- toda diferença deve ser registrada com motivo e responsável;
- a correção precisa ser tratada como ajuste ou divergência, nunca como edição silenciosa.

---

## 13. Resultado esperado da suíte

O objetivo final da suíte é chegar a uma visão objetiva do produto:

```text
DOMAIN TESTS
PASS 42
FAIL 0
BLOCKED 3
NOT IMPLEMENTED 4
```

### Exemplo de status por área

```text
RLS
PASS
Acesso entre congregações bloqueado.

RBAC
PASS
Papéis respeitados.

AUDIT
PASS
Eventos protegidos.

FINANCE
PASS
Saldo calculado corretamente.

CLOSING
PASS
Períodos fechados protegidos.

TRANSFERS
PASS
Repasses conciliados.

IDEMPOTENCY
PASS
Operações duplicadas bloqueadas.

REOPEN
NOT IMPLEMENTED

ADJUSTMENTS
NOT IMPLEMENTED

REVERSALS
NOT IMPLEMENTED

CASH
NOT IMPLEMENTED
```

Este status deve ser o critério para decidir se a equipe segue para telas ou volta para correção do domínio/banco.

---

## 14. Suíte executável da migration 0004

O arquivo `database-tests/04_domain_completion.sql` valida:

- reabertura em duas etapas, motivo obrigatório, não autoaprovação, período aberto, duplicidade e auditoria;
- ajustes positivos e zero inválido, preservação da origem, impacto no resumo, idempotência, auditoria e bloqueio após fechamento;
- estorno integral de despesa, preservação da origem, idempotência, duplicidade e auditoria;
- abertura de caixa, entradas, despesa, depósito, saldo esperado, conferência divergente, justificativa, fechamento, idempotência e isolamento entre congregações.

Estorno parcial permanece fora do escopo da primeira versão.

## 15. Regra final

Se os testes fundamentais passarem, começamos a interface.
Se falharem, corrigimos o domínio ou o banco antes de seguir.

A equipe não deve criar telas funcionais antes de validar a regra de negócio em comportamento real.

---

## 15. Próxima etapa

A próxima ação do projeto deve ser criar a suíte de testes em formato executável, com foco em comportamento e segurança, em vez de prototipar telas.
