# Matriz de permissões: código × PostgreSQL

Gerada a partir de `web/src/domain/access.ts` e das migrations 0001_finance_core.sql–0013_khatam_licenses.sql.

A coluna do banco representa permissões padrão para memberships sem override. Overrides por unidade são tratados separadamente pelo banco. As referências de RPC/RLS são extraídas das definições SQL; esta análise estática não substitui execução em PostgreSQL.

## Perfil × operação

| Perfil | Operação | Código (`access.ts`) | Banco (padrão) | RPC/política RLS | Divergência |
|---|---|---:|---:|---|---|
| `central_admin` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member | — |
| `central_admin` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `central_admin` | `financial.approve` | Permite | Permite | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `central_admin` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `central_admin` | `closing.approve` | Permite | Nega | Sem referência explícita | SIM |
| `central_admin` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `central_admin` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `central_admin` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `congregation_admin` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member | — |
| `congregation_admin` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `congregation_admin` | `financial.approve` | Permite | Permite | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `congregation_admin` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `congregation_admin` | `closing.approve` | Nega | Nega | Sem referência explícita | — |
| `congregation_admin` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `congregation_admin` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `congregation_admin` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `treasurer` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member | — |
| `treasurer` | `financial.write` | Permite | Permite | RPC: has_congregation_permission, has_congregation_role<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `treasurer` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `treasurer` | `closing.submit` | Permite | Permite | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `treasurer` | `closing.approve` | Nega | Nega | Sem referência explícita | — |
| `treasurer` | `audit.read` | Nega | Nega | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `treasurer` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `treasurer` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `auditor` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member | — |
| `auditor` | `financial.write` | Nega | Nega | RPC: has_congregation_permission, has_congregation_role<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `auditor` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `auditor` | `closing.submit` | Nega | Nega | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `auditor` | `closing.approve` | Nega | Nega | Sem referência explícita | — |
| `auditor` | `audit.read` | Permite | Permite | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `auditor` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `auditor` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |
| `viewer` | `financial.read` | Permite | Permite | RPC: get_hierarchical_financial_metrics, has_congregation_permission, is_congregation_member | — |
| `viewer` | `financial.write` | Nega | Nega | RPC: has_congregation_permission, has_congregation_role<br>RLS: finance roles can create entries, finance roles can create expenses, finance roles can create transfers, finance roles can upload documents | — |
| `viewer` | `financial.approve` | Nega | Nega | RPC: approve_expense, approve_transfer, create_financial_adjustment, create_financial_reversal, has_congregation_permission | — |
| `viewer` | `closing.submit` | Nega | Nega | RPC: close_cash_period, close_monthly_period, has_congregation_permission, request_period_reopening | — |
| `viewer` | `closing.approve` | Nega | Nega | Sem referência explícita | — |
| `viewer` | `audit.read` | Nega | Nega | RPC: has_congregation_permission<br>RLS: members can read their audit events | — |
| `viewer` | `hierarchy.view` | Nega | Nega | RPC: has_congregation_permission | — |
| `viewer` | `hierarchy.financial.read` | Nega | Nega | RPC: has_congregation_permission | — |

## Divergências

- `central_admin` × `closing.approve`: código permite; banco nega.

## Cobertura SQL

- RPCs analisadas: 27.
- Políticas RLS declaradas nas migrations: 24.
- Permissões declaradas no código: 8.
