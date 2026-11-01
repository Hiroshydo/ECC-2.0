# Database test suite for Ecclesia Finance

This directory contains the database-first behavior suite for the product contract defined in:

- `docs/domain-spec.md`
- `docs/migration-conformance-review.md`
- `docs/domain-test-plan.md`

The goal is to validate real behavior at the database layer before creating any functional UI.

## Principle

No feature is considered implemented unless the expected behavior is proven by a real database assertion in PostgreSQL/Supabase.

- Security is tested before feature flows.
- Financial rules are tested before interface work.
- Auditing and RLS are treated as non-optional.
- Anything marked `NOT IMPLEMENTED` is intentionally outside the current contract scope.

## Pre-conditions

The database suite requires:

- Docker running with access for the current user;
- the local Supabase project started from `web/`;
- a context that can create fixture rows in `auth.users` when required;
- a clean local database, created by `npm run local:reset`.

## Environment configuration

The suite uses the local database on port `54322` by default. From the repository root:

```bash
cd web
npm run local:up
npm run local:reset
```

Do not set `DATABASE_URL` to a cloud project. The suite is for the local Docker database only.

## How to run

From the repository root:

```bash
bash database-tests/run_suite.sh
```

If the environment is ready, the runner executes the test scripts in order.

The SQL scripts create persistent test fixtures. To run the suite again or restore the app's demo data, reset the local database:

```bash
cd web
npm run local:reset
```

This reset is destructive to the local database and reloads its demonstration seed. Never run it against a cloud project.

## What the runner checks

The runner reports only real outcomes:

- PASS: the rule ran and the assertion passed.
- FAIL: the rule executed but the real assertion failed.
- NOT IMPLEMENTED: the rule is still absent from the domain implementation.
- BLOCKED: environment or database access prevented execution.

## Test priorities

1. Security
2. Authentication
3. Isolation and RBAC
4. Audit
5. Closing
6. Balances
7. Transfer reconciliation
8. Idempotency
9. Transactions
10. Concurrency
11. Reopening
12. Adjustments
13. Integral reversals
14. Physical cash

## Real test contract

Important:

- `RAISE NOTICE` is not a test.
- a successful SQL parse is not a PASS.
- table existence is not proof of correct behavior.
- a real assertion is required.

A test is only `PASS` when it executed an actual action and forced a real condition check.

## Final status model

```text
AUTHENTICATION     PASS / FAIL / BLOCKED
RLS                PASS / FAIL / BLOCKED
RBAC               PASS / FAIL / BLOCKED
AUDIT              PASS / FAIL / BLOCKED
BALANCE            PASS / FAIL / BLOCKED
TRANSFERS          PASS / FAIL / BLOCKED
DIVERGENCE         PASS / FAIL / BLOCKED
IDEMPOTENCY        PASS / FAIL / BLOCKED
TRANSACTION        PASS / FAIL / BLOCKED
CONCURRENCY        PASS / FAIL / BLOCKED
CLOSING            PASS / FAIL / BLOCKED
REOPENING          PASS / FAIL / BLOCKED
ADJUSTMENTS        PASS / FAIL / BLOCKED
REVERSALS          PASS / FAIL / BLOCKED
PHYSICAL CASH      PASS / FAIL / BLOCKED

NOT IMPLEMENTED    NONE
```

Final domain status:

```text
DOMAIN STATUS: PASS
```

when implemented rules pass.

```text
DOMAIN STATUS: FAIL
```

when a rule exists but behaves incorrectly.

```text
DOMAIN STATUS: BLOCKED
```

when infrastructure prevents execution.

## Important limitation

If the current environment cannot create test users in `auth.users` or cannot run the database suite against the target Supabase project, the correct classification is `BLOCKED`, not a fake `PASS`.

This task is intentionally limited to database validation and does not modify the UI or any migration.
