#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="cyapqtyrefkdemhxryvs"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Erro: defina SUPABASE_ACCESS_TOKEN ou execute: npx supabase login"
  exit 1
fi

echo "Vinculando projeto ${PROJECT_REF}..."
npx supabase link --project-ref "$PROJECT_REF"

echo "Aplicando migrations pendentes..."
npx supabase db push

echo "Concluído. Verifique com:"
echo "  select * from employee_app_devices limit 5;"
