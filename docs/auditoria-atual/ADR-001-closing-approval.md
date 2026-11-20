# ADR-001: Aprovação de fechamento

- Status: decisão operacional pendente com o responsável financeiro.
- Decisão temporária: não expor `closing.approve` no modelo de permissões até que o processo de aprovação seja confirmado.

## Contexto

O código declarava `closing.approve` para `central_admin`, mas as migrations não implementam essa capacidade nem uma operação separada de aprovação. O fluxo existente usa `closing.submit` para efetivar o fechamento.

## Consequência

O acesso mais restritivo prevalece: a capacidade sem implementação foi removida do modelo da aplicação e da especificação. Nenhuma permissão ou operação foi adicionada ao banco.

Se o responsável financeiro confirmar que o fechamento precisa de aprovação por outra pessoa, isso exige uma decisão e uma implementação próprias no banco, na interface e nos testes.
