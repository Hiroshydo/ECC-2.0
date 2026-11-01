#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm-local-overwrite" || "$#" -ne 1 ]]; then
  echo "Uso: npm run local:restore -- --confirm-local-overwrite" >&2
  echo "Isso substitui os dados do Supabase local pelo backup local do repositório." >&2
  exit 2
fi

WEB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "${WEB_DIR}/.." && pwd)"
BACKUP="${REPO_DIR}/ecc_producao_local.dump"
CONTAINER="supabase_db_ecc-local"

cd "${WEB_DIR}"
if [[ ! -s "${BACKUP}" ]]; then
  echo "Backup local ausente ou vazio: ${BACKUP}" >&2
  exit 1
fi

STATUS="$(npx supabase status 2>/dev/null)" || {
  echo "Supabase local indisponível. Inicie-o com \`npm run local:up\`." >&2
  exit 1
}
if ! grep -Eq '"linked_project"[[:space:]]*:[[:space:]]*null' <<<"${STATUS}" \
  || ! grep -Eq '"API_URL"[[:space:]]*:[[:space:]]*"http://(127\.0\.0\.1|localhost):54321"' <<<"${STATUS}"; then
  echo "O status não confirmou o Supabase local sem projeto vinculado; nenhum dado foi alterado." >&2
  exit 1
fi

if [[ "$(docker inspect --format '{{.State.Running}}' "${CONTAINER}" 2>/dev/null)" != "true" ]]; then
  echo "Container local ${CONTAINER} não está ativo; nenhum dado foi alterado." >&2
  exit 1
fi

ARCHIVE_LIST="$(docker exec -i "${CONTAINER}" pg_restore -l < "${BACKUP}")"
for required_entry in "TABLE DATA auth instances" "TABLE DATA auth users" "TABLE DATA auth identities" "TABLE DATA public congregations" "TABLE DATA public memberships"; do
  if ! grep -Fq "${required_entry}" <<<"${ARCHIVE_LIST}"; then
    echo "O backup não contém a seção necessária (${required_entry}); nenhum dado foi alterado." >&2
    exit 1
  fi
done

if [[ "$(docker exec "${CONTAINER}" psql -U supabase_admin -d postgres -X -Atc "select (to_regclass('public.congregations') is not null and to_regclass('public.khatam_licenses') is not null)::int;")" != "1" ]]; then
  echo "O banco local não tem o esquema esperado. Execute \`npm run local:reset\` antes da restauração." >&2
  exit 1
fi

echo "Substituindo somente os dados do banco local. O esquema migrado será preservado."
docker exec -i "${CONTAINER}" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -X -q <<'SQL'
TRUNCATE TABLE
  public.audit_events,
  public.congregations,
  public.documents,
  public.entries,
  public.expenses,
  public.financial_adjustments,
  public.financial_reversals,
  public.headquarters_transfers,
  public.khatam_licenses,
  public.membership_permission_overrides,
  public.memberships,
  public.monthly_closings,
  public.period_reopening_requests,
  public.physical_cash_movements,
  public.physical_cash_periods,
  public.physical_cash_registers
CASCADE;
TRUNCATE TABLE auth.identities, auth.users, auth.instances CASCADE;
SQL

for table in instances users identities; do
  docker exec -i "${CONTAINER}" pg_restore \
    -U supabase_admin \
    --data-only \
    --no-owner \
    --no-acl \
    --exit-on-error \
    --dbname=postgres \
    --schema=auth \
    --table="${table}" < "${BACKUP}"
done

docker exec -i "${CONTAINER}" pg_restore \
  -U supabase_admin \
  --data-only \
  --no-owner \
  --no-acl \
  --disable-triggers \
  --exit-on-error \
  --single-transaction \
  --dbname=postgres \
  --schema=public < "${BACKUP}"

docker exec "${CONTAINER}" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -X -q <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE encrypted_password <> '' AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Backup restaurado sem nenhum usuário ativo com senha.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.congregations) OR NOT EXISTS (SELECT 1 FROM public.memberships) THEN
    RAISE EXCEPTION 'Backup restaurado sem congregações ou vínculos.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.memberships m
    LEFT JOIN auth.users u ON u.id = m.user_id
    WHERE u.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Backup contém vínculos sem usuário correspondente.';
  END IF;
END
$$;
SQL

COUNTS="$(docker exec "${CONTAINER}" psql -U supabase_admin -d postgres -X -Atc "select 'users='||(select count(*) from auth.users)||', congregations='||(select count(*) from public.congregations)||', memberships='||(select count(*) from public.memberships)||', entries='||(select count(*) from public.entries)||', expenses='||(select count(*) from public.expenses);")"
printf 'Restauração local concluída: %s\n' "${COUNTS}"
