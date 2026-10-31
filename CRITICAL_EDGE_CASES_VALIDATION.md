# VALIDAÇÃO CRÍTICA FINAL - Migration 0004

## Edge Cases e Potenciais Problemas

### 1. Ajustes em Período Já Reaberto
**Cenário**: Período fechado, reabertura solicitada, DURANTE a solicitação, novo ajuste é tentado.

**Verificação**:
- `create_financial_adjustment` valida: `if public.period_is_closed(source_congregation, source_period)`
- Se a reabertura foi aprovada, status passa para 'open'
- A próxima verificação de `period_is_closed` retornará false
- ✅ Comportamento correto: após reabertura, ajustes são permitidos

---

### 2. Estorno de Entrada Revertida
**Cenário**: Entrada A é revertida, depois tenta-se estornar a reversão (não há row de entrada B).

**Verificação**:
- `create_financial_reversal` tenta buscar a entry A
- Entry A ainda existe (reversals não deletam)
- Tenta inserir reversão com unique (entity_type='entries', entity_id=A_id)
- Já existe reversão anterior, unique constraint falha
- `on conflict do nothing` → retorna null
- Verifica: `if reversal.id is null then select * ... if created_by e idempotency_key batem return else raise 'reversal_already_exists'`
- ✅ Comportamento correto: segunda reversão bloqueada

---

### 3. Saldo Negativo em Caixa com Movimentos Concorrentes
**Cenário**: Saldo 100, dois usuários tentam sacar 80 simultaneamente.

**Verificação**:
- User 1: `record_cash_movement(..., 'cash_expense', 80, ...)`
  - Adquire lock: `select p into period_row from physical_cash_periods p where p.id = ... for update`
  - Calcula expected_balance = 100
  - Valida: 100 >= 80? Sim, passa
  - Insere movimento
- User 2: `record_cash_movement(..., 'cash_expense', 80, ...)` (tenta durante User 1)
  - Aguarda lock (bloqueado)
  - Quando adquire lock após User 1:
  - Recalcula expected_balance = 100 - 80 = 20
  - Valida: 20 >= 80? Não, **BLOQUEADO**
- ✅ Comportamento correto: lock FOR UPDATE garante serialização

---

### 4. Duplicação de Caixa no Mesmo Período
**Cenário**: Dois usuários abrem o mesmo caixa no mesmo período.

**Verificação**:
- Unique constraint: `(cash_register_id, reference_period)`
- User 1 insere primeiro
- User 2 tenta inserir → constraint violation
- PostgreSQL não permite duplicação
- ✅ Comportamento correto: segunda abertura rejeitada

---

### 5. Idempotência com Chave Alterada
**Cenário**: Mesmo usuário tenta fazer ajuste idêntico mas com idempotency_key diferente.

**Verificação** (adjustment):
- Chave 1: insere sucesso
- Chave 2 (mesma congregação, entidade, usuário): insere novo = diferente da idempotência
- Resultado: dois ajustes de +5000 no saldo
- ⚠️ **NÃO é idempotência de operação, é idempotência de call**
- Isto é CORRETO por design: idempotência protege contra retry do mesmo request, não protege contra dois requests diferentes

**Verificação** (reversal):
- Unique constraint: `(entity_type, entity_id)` - só UMA reversão por entidade
- Chave 1: insere sucesso
- Chave 2 (mesma entidade mas chave diferente): unique constraint falha
- Verifica: existing reversal se é do mesmo usuário/chave → não é → `'reversal_already_exists'`
- ✅ Comportamento correto: força integral reversal, nunca dois estornos

---

### 6. Reabertura Duplicada (Concurrent)
**Cenário**: Dois usuários tentam solicitar reabertura para o mesmo período.

**Verificação**:
- Unique index: `(congregation_id, reference_period) where status = 'pending'`
- User 1: insere solicitação A
- User 2: tenta inserir solicitação B (mesma congregação/período)
- Constraint violation
- ✅ Comportamento correto: apenas uma solicitação pending

---

### 7. Aprovação por Não-Admin
**Cenário**: Treasurer tenta aprovar reabertura.

**Verificação**:
- `approve_period_reopening()` valida:
  - `if not public.has_congregation_role(request_row.congregation_id, array['central_admin'])`
  - Treasurer NÃO está em ['central_admin']
  - Levanta exceção 'reopening_approval_not_allowed'
- ✅ Comportamento correto: bloqueado

---

### 8. Central Admin Global (Sede) aprovando outra congregação
**Cenário**: central_admin de Sede aprova reabertura de Cong A (não tem membership).

**Verificação**:
- `approve_period_reopening()` valida:
  - `if not public.has_congregation_role(request_row.congregation_id, array['central_admin'])`
  - Consulta memberships para (user_id, congregation_id=Cong_A, role='central_admin')
  - Nenhum resultado (usuario está em Sede, não em Cong A)
  - Levanta exceção
- Teste explicita isto: central_admin de Sede tenta approvar reopening de Cong A → BLOCKED
- ✅ Comportamento correto: central_admin é congregacional

---

### 9. Movimento de Caixa sem Razão
**Cenário**: Usuário tenta registrar movimento sem informar reason.

**Verificação**:
- `record_cash_movement()` valida:
  - `if p_reason is null or btrim(p_reason) = '' then raise exception 'cash_reason_required'`
- ✅ Comportamento correto: bloqueado

---

### 10. Contagem sem Divergência Reason (quando há divergência)
**Cenário**: Saldo esperado 100, contado 95, mas sem informar reason.

**Verificação**:
- `count_cash()` valida:
  - `if p_counted_balance_cents <> expected_balance and (p_divergence_reason is null or btrim(p_divergence_reason) = '') then raise exception 'cash_divergence_reason_required'`
  - 95 <> 100 (true) AND reason = null (true)
  - Levanta exceção
- Contagem com divergência exige reason
- Contagem sem divergência (100 == 100) pode ter reason = null
- ✅ Comportamento correto

---

### 11. Período Financeiro vs Período do Movimento
**Cenário**: Entry ocorreu em 2024-01-15, período financeiro de Jan foi fechado, mas usuário tenta criar ajuste.

**Verificação**:
- `create_financial_adjustment()` busca a entry:
  - `select occurred_on into source_period from public.entries where id = p_entity_id`
  - source_period = 2024-01-15
- Valida fechamento:
  - `if public.period_is_closed(source_congregation, source_period)`
  - Chama `period_is_closed()` que verifica:
    - `select exists (... where reference_period = date_trunc('month', source_period)::date and status = 'closed')`
    - reference_period = date_trunc('month', '2024-01-15')::date = '2024-01-01'
    - Se monthly_closing para Jan tem status='closed', retorna true
- ✅ Comportamento correto: ajuste bloqueado em período fechado

---

### 12. Auditoria Imutável
**Cenário**: Usuário tenta UPDATE de audit_event.

**Verificação**:
- `audit_events` tem RLS habilitada
- Nenhuma política INSERT/UPDATE/DELETE definida
- Padrão de PostgreSQL: sem política = sem write
- ✅ Comportamento correto: auditoria imutável

---

### 13. Cross-Congregation Access via RLS
**Cenário**: User de Cong A tenta ler adjustments de Cong B.

**Verificação**:
- RLS policy: `select using (public.is_congregation_member(congregation_id))`
- Query `select * from financial_adjustments where congregation_id = Cong_B`
- Policy verifica se usuário é membro de Cong_B
- Não é (é membro de Cong_A)
- Nenhuma linha retorna
- ✅ Comportamento correto: isolamento total

---

### 14. Cash Period Closure Without Counting
**Cenário**: Tenta fechar caixa sem fazer contagem.

**Verificação**:
- `close_cash_period()` valida:
  - `if period_row.counted_balance_cents is null then raise exception 'cash_count_required'`
- ✅ Comportamento correto: requer contagem

---

### 15. Saldo Físico Negativo - Cálculo Correto
**Cenário**: Abertura 50000, cash_in 100000, cash_expense 130000, cash_deposit 80000.

**Sequência**:
1. opening = 50000
2. cash_in +100000 → 150000 (ok)
3. cash_expense -130000 → 20000 (ok, 150000 >= 130000)
4. cash_deposit -80000 → ??? 

**Verificação**:
- Quando tenta deposit -80000:
- expected_balance = 50000 + 100000 - 130000 = 20000
- Valida: `if movement_type <> 'cash_in' and expected_balance < amount then raise`
- `'deposit' <> 'cash_in'` = true
- `20000 < 80000` = true
- **Levanta exceção 'cash_insufficient_balance'** ✅

---

### Conclusão
Todos os edge cases validados:
- ✅ Concorrência via locks
- ✅ Idempotência por chaves
- ✅ Isolamento congregacional
- ✅ Auditoria imutável
- ✅ Validação de saldo negativo
- ✅ Permissões por papel
- ✅ Integridade de dados

**Status Final**: SEM PROBLEMAS CRÍTICOS DETECTADOS

---

*Validação: 2024-08-14*
