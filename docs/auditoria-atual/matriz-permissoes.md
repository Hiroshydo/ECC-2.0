# Matriz de permissões: código × PostgreSQL

Gerada a partir de `web/src/domain/access.ts` e das migrations 0001_finance_core.sql–0014_transfer_send.sql.

A coluna do banco representa permissões padrão para memberships sem override. Overrides por unidade são tratados separadamente pelo banco. As referências de RPC/RLS são extraídas das definições SQL; esta análise estática não substitui execução em PostgreSQL.

## Perfil × operação

| Perfil | Operação | Código (`access.ts`) | Banco (padrão) | RPC/política RLS | Divergência |
|---|---|---:|---:|---|---|
| `central_admin` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member<br>RLS: members can read transfer send details | — |
| `central_admin` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role, request_transfer<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `central_admin` | `financial.approve` | Permite | Permite | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `central_admin` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `central_admin` | `transfer.send` | Nega | Nega | RPC: has_congregation_permission, mark_transfer_sent | — |
| `central_admin` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `central_admin` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `central_admin` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `congregation_admin` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member<br>RLS: members can read transfer send details | — |
| `congregation_admin` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role, request_transfer<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `congregation_admin` | `financial.approve` | Permite | Permite | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `congregation_admin` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `congregation_admin` | `transfer.send` | Nega | Nega | RPC: has_congregation_permission, mark_transfer_sent | — |
| `congregation_admin` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `congregation_admin` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `congregation_admin` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `treasurer` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member<br>RLS: members can read transfer send details | — |
| `treasurer` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role, request_transfer<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `treasurer` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `treasurer` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `treasurer` | `transfer.send` | Permite | Permite | RPC: has_congregation_permission, mark_transfer_sent | — |
| `treasurer` | `audit.read` | Nega | Nega | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `treasurer` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `treasurer` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `auditor` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member<br>RLS: members can read transfer send details | — |
| `auditor` | `financial.write` | Nega | Nega | RPC: has_congregation_permission, has_congregation_role, request_transfer<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `auditor` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `auditor` | `closing.submit` | Nega | Nega | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `auditor` | `transfer.send` | Nega | Nega | RPC: has_congregation_permission, mark_transfer_sent | — |
| `auditor` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `auditor` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `auditor` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `viewer` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member<br>RLS: members can read transfer send details | — |
| `viewer` | `financial.write` | Nega | Nega | RPC: has_congregation_permission, has_congregation_role, request_transfer<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `viewer` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `viewer` | `closing.submit` | Nega | Nega | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `viewer` | `transfer.send` | Nega | Nega | RPC: has_congregation_permission, mark_transfer_sent | — |
| `viewer` | `audit.read` | Nega | Nega | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `viewer` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `viewer` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |

## Divergências

- Nenhuma divergência entre permissões padrão foi detectada.

## Cobertura SQL

- RPCs analisadas: 28.
- Políticas RLS declaradas nas migrations: 25.
- Permissões declaradas no código: 8.
