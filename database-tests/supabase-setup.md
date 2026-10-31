# Supabase setup for Ecclesia Finance

## Goal

Prepare a real PostgreSQL/Supabase environment to execute the database contract tests without exposing secrets in Git.

## 1. Create or select the Supabase project

1. Open the Supabase dashboard.
2. Create a new project or select an existing one.
3. Note the project URL and keys.

## 2. Configure environment variables locally

Create a local environment file at the repository root:

```bash
cp .env.example .env.local
```

Then fill the values with the project-specific credentials you receive from Supabase.

Important:

- never commit `.env.local`;
- never put `service_role` in frontend code;
- never place secrets in Git-tracked files.

## 3. Configure the app environment

The Next.js app in `web/` expects:

```bash
web/.env.local
```

with at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The database runner may use:

```bash
DATABASE_URL=
# or
PGHOST=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGPORT=5432
```

## 4. Apply the schema migrations

Run the migrations in order:

```bash
cd web
supabase db push
```

If using SQL files directly, apply them in this order:

1. `supabase/migrations/0001_finance_core.sql`
2. `supabase/migrations/0002_integrity_and_documents.sql`
3. `supabase/migrations/0003_financial_cycle_commands.sql`
4. `supabase/migrations/0004_domain_completion.sql`
5. `supabase/migrations/0005_domain_completion_fix.sql`
6. `supabase/migrations/0006_cash_movement_idempotency_fix.sql`
7. `supabase/migrations/0007_performance_indexes.sql`

## 5. Confirm the objects were created

Check that the following exist in the database:

- `public.congregations`
- `public.memberships`
- `public.entries`
- `public.expenses`
- `public.headquarters_transfers`
- `public.monthly_closings`
- `public.audit_events`
- `public.documents`
- security functions and triggers
- row-level security policies

## 6. Execute the contract suite

From the repository root:

```bash
bash database-tests/run_suite.sh
```

## 7. Interpret the report

- `PASS`: domain rule proved correct
- `FAIL`: domain rule is broken
- `NOT IMPLEMENTED`: known gap
- `BLOCKED`: infrastructure is the blocker

## 8. Do not commit secrets

This file must remain local only:

- `.env.local`
- `web/.env.local`

The versioned file is only:

- `.env.example`

It contains variable names, not secrets.
