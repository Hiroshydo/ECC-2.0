# Especificação funcional do domínio — Ecclesia Finance

## Objetivo

Este documento define o contrato financeiro do Ecclesia Finance e serve como fonte de verdade para banco de dados, RPCs, RLS, permissões, telas, relatórios e auditoria.

Ele deve ser tratado como o ponto de congelamento do escopo antes de qualquer nova implementação funcional.

## Regra geral

Nenhuma tela deve definir regra financeira.

A regra financeira deve existir no domínio e no banco. A interface apenas apresenta informações e solicita a operação. A validação real acontece no domínio e, quando possível, no banco por meio de constraints, triggers e funções server-side.

Regra de precedência:

Quando o código existente divergir do `domain-spec.md`, o código deve ser corrigido. O domínio não deve ser alterado para acomodar uma implementação inadequada.

Exemplo:

- Usuário tenta criar uma despesa de R$ 1.000.
- A interface envia a intenção.
- O domínio verifica:
  - usuário autenticado;
  - congregação pertence ao usuário;
  - usuário possui permissão;
  - período está aberto;
  - categoria é válida;
  - valor é válido;
  - documentação obrigatória;
  - aprovação necessária;
  - saldo/impacto permitido.
- Só então a operação é executada.

Este padrão evita espalhar regras entre interface, serviço e banco, como aconteceu no projeto anterior.

---

## 1. Entidades do domínio

### 1.1 Usuário

- `user_id`
- `name`
- `email`
- `status`: ativo/inativo

### 1.2 Congregação

- `congregation_id`
- `name`
- `city`
- `active`

### 1.3 Vinculo de usuário e congregação

- `membership_id`
- `user_id`
- `congregation_id`
- `role`
- `active`

### 1.4 Período financeiro

- `congregation_id`
- `reference_period` (mês)
- `opening_balance`
- `closing_balance`
- `status`
- `submitted_by`
- `approved_by`
- `closed_at`

### 1.5 Entrada

- `entry_id`
- `congregation_id`
- `occurred_on`
- `amount`
- `category`
- `origin`
- `payment_method`
- `purpose`
- `recorded_by`
- `status`
- `document_required`

### 1.6 Despesa

- `expense_id`
- `congregation_id`
- `occurred_on`
- `amount`
- `category`
- `description`
- `vendor`
- `payment_method`
- `purpose`
- `cost_center`
- `status`
- `recorded_by`
- `approved_by`
- `document_required`

### 1.7 Repasse para sede

- `transfer_id`
- `origin_congregation_id`
- `destination_name`
- `reference_period`
- `amount_sent`
- `amount_received`
- `occurred_on`
- `status`
- `reason`
- `requested_by`
- `approved_by`
- `document_required`

### 1.8 Ajuste e estorno

- `correction_id`
- `congregation_id`
- `entity_type`
- `entity_id`
- `amount`
- `reason`
- `type`: ajuste / estorno / reabertura
- `created_by`
- `approved_by`
- `effective_at`

### 1.9 Documentos e comprovantes

- `document_id`
- `congregation_id`
- `entity_type`
- `entity_id`
- `storage_path`
- `file_name`
- `content_type`
- `uploaded_by`
- `created_at`

### 1.10 Auditoria

- `audit_event_id`
- `actor_id`
- `congregation_id`
- `action`
- `entity`
- `entity_id`
- `occurred_at`
- `before`
- `after`
- `reason`

---

## 2. Estados do domínio

### 2.1 Entrada

- `draft`
- `registered`
- `questioned`
- `reversed`

Regra: entrada só pode alterar saldo quando finalizada e válida.

### 2.2 Despesa

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `paid`
- `questioned`
- `reversed`

Regra: a despesa pode exigir aprovação antes de impactar saldo ou de ser considerada liquidada.

### 2.3 Repasse

- `draft`
- `requested`
- `approved`
- `sent`
- `confirmed`
- `questioned`
- `cancelled`

Regra: o repasse pode registrar saída na congregação e, em seguida, confirmação na sede.

### 2.4 Fechamento de período

- `open`
- `submitted`
- `approved`
- `questioned`
- `closed`

Regra: somente período aberto admite movimentação financeira. Período fechado exige correção ou reabertura explícita.

### 2.5 Ajuste/estorno

- `pending`
- `approved`
- `posted`
- `reversed`

Regra: ajuste e estorno nunca são operações implícitas. Sempre devem ser executados como comando específico, com auditoria e justificativa.

---

## 3. Regras de saldo

### 3.1 Fórmula do período

O saldo do período deve ser calculado de forma determinística:

$$
\text{saldo final} = \text{saldo inicial} + \text{entradas} - \text{despesas} - \text{repasses} + \text{ajustes}
$$

### 3.2 Restrições

- saldo não pode ser negativo para uma congregação sem autorização formal de ajuste;
- entradas e despesas devem ser segregadas no mesmo período;
- repasse é tratado como movimentação financeira e deve ser rastreado separadamente;
- qualquer ajuste deve identificar a causa e o responsável;
- um período fechado não pode receber alterações diretas.

### 3.3 Regras de divergência

- se o valor enviado pelo repasse não coincidir com o valor recebido, o status deve entrar em `questioned`;
- divergência exige revisão e aprovação de responsável autorizado;
- divergência não pode ser escondida em UI; deve ser visível em relatório e em auditoria.

---

## 4. Regras de entrada

- Usuário deve pertencer à congregação.
- Somente papéis autorizados podem registrar entradas.
- Valor deve ser maior que zero.
- `occurred_on` deve estar dentro do período vigente.
- Um período fechado impede criação de nova entrada naquele período.
- Documento obrigatório fica configurado por regra de negócio, não por tela.
- Todo registro gera auditoria append-only.

### Regras especiais

- a origem da entrada precisa ser identificada;
- o método de pagamento precisa ser válido;
- entradas podem ser classificadas por categoria financeira específica;
- entradas podem ser revertidas somente por operação explícita de estorno.

---

## 5. Regras de despesa

- identificada por categoria, finalidade, descrição e valor;
- valor maior que zero;
- geralmente exige aprovação antes de ser considerada efetivada;
- pode exigir documento comprovante;
- se a despesa for de centro de custo ou categoria sensível, deve exigir aprovação de cargo superior;
- não pode ser criada em período fechado;
- só pode ser alterada por operação de correção, ajuste ou estorno;
- toda mudança gera auditoria.

### Fluxo padrão

- `draft` -> `pending_approval` -> `approved` -> `paid` ou `questioned`
- rejeição ou reversão também devem preservar o histórico completo.

---

## 6. Regras de repasse

- repasse representa uma baixa financeira da congregação para a sede ou outra unidade;
- deve trazer referência de período e valor;
- requer justificativa e documento, quando configurado;
- somente usuário com permissão de tesouraria pode solicitar;
- a sede ou autoridade competente aprova ou questiona;
- confirmação da sede pode alterar o status para `confirmed` ou `questioned`;
- divergência entre valor enviado e recebido não é aceita como operação normal; deve ser tratada como desvio.

---

## 7. Regras de ajuste e estorno

- nunca devem ser feitos por `UPDATE` ou `DELETE` direto na linha financeira;
- devem existir como operações explícitas de correção, estorno ou reabertura;
- devem conter motivo obrigatório;
- devem ser auditadas por actor, antes/depois e razão;
- ajuste pode ser positivo ou negativo conforme a regra de correção;
- estorno reverte impacto financeiro e mantém histórico imutável.

---

## 8. Regras de caixa físico

O caixa físico, quando aplicável, deve ser tratado como um controle auxiliar, mas nunca substitui o registro financeiro principal.

- todo valor em caixa deve ter origem e destino claros;
- diferenças de caixa devem ser registradas não como alteração silenciosa, mas como ajuste ou divergência;
- o caixa físico deve ser reconciliado com o saldo financeiro por período;
- caso exista diferença não explicada, a operação deve ser marcada como `questioned`.

---

## 9. Prestação de contas

A prestação de contas deve derivar do histórico financeiro do período e não de telas manuais compostas.

### Requisitos

- todo movimento deve ser rastreável por documento, responsável e data;
- o relatório deve consolidar entradas, despesas, repasses, ajustes e fechamento;
- o resumo deve mostrar origem do saldo e não apenas o resultado final;
- a prestação de contas deve permitir filtrar por congregação, período e responsável.

---

## 10. Fechamento e reabertura

### Fechamento

- exige autorização de administrador ou gestor responsável pelo período;
- não deve permitir novas movimentações diretas no período fechado;
- deve gerar auditoria de fechamento;
- deve indicar saldo final, pendências e divergências.

### Reabertura

- somente por operação autorizada e auditada;
- não pode ser uma edição direta do registro de fechamento;
- a reabertura deve ser explicitamente registrada para preservar rastreabilidade.

---

## 11. Auditoria

A auditoria deve ser append-only e imutável por regra de negócio.

### Obrigatoriedades

- quem executou a ação;
- em qual congregação;
- qual entidade foi modificada;
- antes e depois da operação;
- motivo da ação;
- data/hora.

### Regras

- qualquer criação, aprovação, rejeição, ajuste, estorno, fechamento ou divergência gera evento de auditoria;
- o sistema não deve permitir exclusão de eventos de auditoria;
- eventos devem ser legíveis apenas por usuários autorizados.

---

## 12. Documentos e comprovantes

- documentos são vinculados à entidade financeira e não apenas ao usuário;
- comprovante pode ser requerido por regra de operação;
- o documento pode ser obrigatório por categoria, tipo de despesa, repasse ou ajuste;
- o arquivo deve ser persistido em storage obedecendo ao vínculo de congregação;
- a ausência de documento obrigatório deve bloquear a operação.

---

## 13. RBAC

### Roles

- `central_admin`
- `congregation_admin`
- `treasurer`
- `auditor`
- `viewer`

### Permissões mínimas

- `financial.read`
- `financial.write`
- `financial.approve`
- `closing.submit`
- `closing.approve`
- `audit.read`

### Regras

- leitura e escrita devem ser limitadas por congregação;
- aprovação requer papel específico e vínculo ativo;
- auditor só lê, não altera dados financeiros;
- visualização não implica autorização de escrita ou aprovação.

---

## 14. Isolamento entre congregações

- toda entidade financeira deve ter `congregation_id` explícito;
- acesso deve ser restrito por congregação;
- qualquer operação deve confirmar que o usuário pertence à congregação alvo;
- relatórios e visão de igreja devem ser segmentados por congregação, nunca agregados sem filtro de autorização;
- a sede deve ter visão de dados somente para as congregações sob sua responsabilidade, conforme regra de vínculo.

---

## 15. Regras de divergência

Divergência é uma condição de exceção que deve ser rastreada e tratada explicitamente.

### Casos

- valor registrado não bate com valor recebido;
- despesa sem comprovante obrigatório;
- período com fechamento inconsistente;
- saldo fora da faixa esperada;
- movimento sem responsável ou sem autorização.

### Tratamento

- marca `questioned` ou status equivalente;
- exige justificativa e revisão;
- deve continuar visível em relatórios e auditoria;
- não pode ser silenciada por interface ou auto-correção sem aprovação.

---

## 16. Relatórios derivados

Todos os relatórios devem depender do domínio e do banco, não de lógica de tela.

### Relatórios esperados

- saldo por congregação e período;
- entradas por categoria;
- despesas por categoria e centro de custo;
- repasses por período e destino;
- pendências de aprovação;
- divergências e ajustes;
- histórico de auditoria por entidade;
- prestação de contas por congregação.

### Regra

A tela pode apresentar o relatório, mas o cálculo e a fonte dos dados devem vir do domínio e da base de dados.

---

## 17. Matriz de operações

| Operação | Quem executa | Estado inicial | Estado final | Impacta saldo | Exige aprovação | Exige documento | Gera auditoria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Entrada | Tesoureiro | Rascunho | Registrada | Sim | Configurável | Configurável | Sim |
| Despesa | Tesoureiro | Rascunho | Aguardando aprovação | Não ou sim, conforme regra | Sim | Sim | Sim |
| Repasse | Tesoureiro | Rascunho | Solicitado | Sim | Sim | Sim | Sim |
| Confirmação de repasse | Sede | Enviado | Confirmado | Não novamente | Não | Comprovante | Sim |
| Estorno | Administrador | Efetivado | Estornado | Reverte | Sim | Motivo | Sim |
| Fechamento | Administrador | Em conferência | Fechado | Não | Sim | Não | Sim |
| Ajuste | Administrador/gestor | Aberto | Ajustado | Sim | Sim | Condicional | Sim |
| Reabertura | Administrador | Fechado | Aberto | Não | Sim | Não | Sim |

Esta tabela representa o contrato do sistema e deve ser respeitada por banco, RPCs, permissões e interfaces.

---

## 18. Contrato de implementação

Antes de nova implementação funcional, o projeto deve respeitar esta sequência:

1. Domínio
2. Regras de negócio
3. Estados
4. Permissões
5. Modelo de dados
6. RPCs
7. RLS
8. Testes
9. Interface
10. Relatórios

Qualquer mudança fora dessa ordem deve ser considerada uma exceção e revisada.

---

## 19. Status do escopo

Este documento define o escopo congelado para o próximo ciclo de desenvolvimento. A partir deste ponto:

- não se cria nova tela sem contrato de domínio;
- não se cria regra financeira em UI;
- não se altera o modelo financeiro sem revisar este documento;
- próximo passo é revisar as migrations `0001`, `0002` e `0003` contra este contrato antes de criar a próxima migration.

A especificação acima é o contrato do Ecclesia Finance.
