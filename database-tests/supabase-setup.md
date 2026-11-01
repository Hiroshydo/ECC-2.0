# Local Supabase setup for Ecclesia Finance

## Goal

Run the app and database contract tests against a local Supabase stack in Docker. No cloud project is required.

## 1. Start the local services

From `web/`:

```bash
npm ci
npm run local:up
npm run local:reset
npm run local:restore -- --confirm-local-overwrite
npm run jordao -- use local
```

The reset applies all local migrations and loads a demonstration seed. To work with the repository's local backup instead, run the explicitly destructive restore command shown above; it replaces the local demo data with the backup's users and application data. The profile command writes local credentials to the ignored `web/.env.local` file with restricted permissions. These commands do not configure or contact a cloud project.

Do not run `supabase link`, `supabase db push`, or use a cloud `DATABASE_URL` for this workflow.

## 2. Run the app

```bash
npm run dev
```

The demo credentials are documented in `web/supabase/seed.sql`. Studio and Mailpit URLs are listed by `npm run local:status`.

## 3. Execute the contract suite

From the repository root, run the suite against the local database:

```bash
bash database-tests/run_suite.sh
```

The suite creates persistent SQL test fixtures. Run `npm run local:reset` from `web/` before repeating it or returning the database to the demo seed.

## 4. Keep credentials local

`web/.env.local` is ignored by Git and must not be committed. Never copy local keys into tracked files.
