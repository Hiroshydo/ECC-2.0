#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export ROOT_DIR

print_status() {
  local name="$1"
  local value="$2"
  printf '%-20s %s\n' "${name}" "${value}"
}

print_blocked_summary() {
  echo "DOMAIN TEST SUITE"
  echo "================="
  echo
  print_status "DATABASE CONNECTION" "BLOCKED"
  echo "DOMAIN STATUS: BLOCKED"
}

run_psql() {
  if [[ -n "${SUPABASE_LOCAL_CONTAINER:-}" ]]; then
    docker exec -i "${SUPABASE_LOCAL_CONTAINER}" psql -U postgres -d postgres "$@"
  else
    PGPASSWORD="${PGPASSWORD:-}" psql "${DB_CONN}" "$@"
  fi
}

if [[ -n "${SUPABASE_LOCAL_CONTAINER:-}" ]]; then
  if ! command -v docker >/dev/null 2>&1 ||
    ! docker exec "${SUPABASE_LOCAL_CONTAINER}" pg_isready -U postgres -d postgres >/dev/null 2>&1; then
    print_blocked_summary
    echo "Reason: the configured local Supabase database container is unavailable."
    exit 0
  fi
elif [[ -n "${DATABASE_URL:-}" ]]; then
  DB_CONN="${DATABASE_URL}"
elif [[ -n "${PGHOST:-}" && -n "${PGUSER:-}" && -n "${PGDATABASE:-}" ]]; then
  DB_CONN="postgresql://${PGUSER}@${PGHOST}:${PGPORT:-5432}/${PGDATABASE}"
else
  print_blocked_summary
  echo "Reason: no PostgreSQL/Supabase connection is available."
  exit 0
fi

echo "Checking authenticated execution context"
if ! run_psql -v ON_ERROR_STOP=1 -X -Atc \
  "begin; set local role authenticated; select set_config('request.jwt.claims', '{\"sub\":\"66666666-6666-4666-8666-666666666666\",\"role\":\"authenticated\",\"aud\":\"authenticated\"}', true); select set_config('request.jwt.claim.sub', '66666666-6666-4666-8666-666666666666', true); select set_config('request.jwt.claim.role', 'authenticated', true); select current_user, current_role, auth.uid(); do \$\$ begin if current_user <> 'authenticated' or current_role <> 'authenticated' or auth.uid() is distinct from '66666666-6666-4666-8666-666666666666'::uuid then raise exception 'AUTH_CONTEXT_MISMATCH: user=%, role=%, uid=%', current_user, current_role, auth.uid(); end if; end \$\$; rollback;"; then
  echo "DOMAIN STATUS: BLOCKED"
  echo "Reason: direct psql could not reproduce the authenticated Supabase role/claims context safely."
  exit 0
fi

SQL_FILES=(
  "database-tests/01_test_seed.sql"
  "database-tests/02_security_rls.sql"
  "database-tests/03_financial_flow.sql"
  "database-tests/04_domain_completion.sql"
  "database-tests/00_domain_suite.sql"
)

echo "DOMAIN TEST SUITE"
echo "================="

PASSED_FILES=()
echo
for file in "${SQL_FILES[@]}"; do
  if [[ ! -f "${ROOT_DIR}/${file}" ]]; then
    echo "BLOCKED: missing file ${file}"
    echo "DOMAIN STATUS: BLOCKED"
    exit 3
  fi
  echo "Running ${file}"
  if run_psql -v ON_ERROR_STOP=1 -X < "${ROOT_DIR}/${file}"; then
    echo "Result: script completed without assertion failures."
  else
    echo "Result: script failed with SQL assertions or runtime error."
    echo "Failed script: ${file}"
    echo "DOMAIN STATUS: FAIL"
    exit 1
  fi
  PASSED_FILES+=("${file#database-tests/}")
  echo
done

echo "Execution summary"
echo "================="
for file in "${PASSED_FILES[@]}"; do
  print_status "${file}" "PASS"
done

echo
printf 'DOMAIN STATUS: PASS\n'
