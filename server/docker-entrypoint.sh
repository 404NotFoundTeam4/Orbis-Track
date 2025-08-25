#!/bin/sh
set -e

# ---- config ----
: "${PRISMA_SCHEMA_PATH:=./src/infrastructure/database/prisma/schema.prisma}"
: "${NODE_ENV:=development}"
: "${ALLOW_DB_PUSH_IN_PROD:=false}"
: "${PGHOST:=db}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"        # superuser
: "${PGPASSWORD:=postgres}"
export PGPASSWORD

PRISMA_DEV_APPLY=migrate
PRISMA_MIGRATION_NAME=init

psql_admin() { psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -v ON_ERROR_STOP=1 "$@"; }

SCHEMA_DIR="$(dirname "$PRISMA_SCHEMA_PATH")"
MIGRATIONS_DIR="$SCHEMA_DIR/migrations"
# ถ้าใน schema ตั้ง output เป็น "../generated/prisma" ตามตัวอย่างเดิม
CLIENT_DIR="$SCHEMA_DIR/../generated/prisma"

echo "== Prisma entrypoint =="
echo "NODE_ENV=$NODE_ENV"
echo "PRISMA_SCHEMA_PATH=$PRISMA_SCHEMA_PATH"
echo "DB_ADMIN_URL=${DB_ADMIN_URL:-<unset>}"
command -v psql >/dev/null || echo "⚠️  psql not found in image"

if [ ! -f "$PRISMA_SCHEMA_PATH" ]; then
  echo "❌ Prisma schema not found at $PRISMA_SCHEMA_PATH"
  exit 1
fi

# ติดตั้ง dev deps ถ้ายังไม่มี (กรณีถูกทับด้วย volume)
ensure_dev_deps() {
if ! command -v nodemon >/dev/null 2>&1; then
  if [ -f ../package-lock.json ]; then
    echo "📦 npm ci (workspaces at repo root)..."
    (cd .. && npm ci --workspaces --include-workspace-root)
  elif [ -f package-lock.json ]; then
    echo "📦 npm ci (local)..."
    npm ci
  else
    echo "📦 package-lock.json ไม่เจอ → ใช้ npm i แทน"
    npm i
  fi
fi
}

# ---- wait for DB (ลองเชื่อมต่อด้วย prisma; ลูปจนกว่าจะได้) ----
wait_for_db() {
  echo "⏳ Waiting for Postgres to accept connections..."
  i=0
  while [ $i -lt 60 ]; do
    # ✅ ไม่ต้องพึ่งตาราง _prisma_migrations
    if [ -n "${DATABASE_URL:-}" ] && echo "SELECT 1;" | npx prisma db execute --stdin --url "$DATABASE_URL" >/dev/null 2>&1; then
      echo "✅ Database responded to SELECT 1."
      return 0
    fi
    # ทางเลือกเสริม: ถ้ามี pg_isready ติดอยู่ในอิมเมจ
    if command -v pg_isready >/dev/null 2>&1; then
      if pg_isready -h "${POSTGRES_HOST:-db}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-postgres}" >/dev/null 2>&1; then
        echo "✅ Postgres is ready."
        return 0
      fi
    fi
    # if command -v pg_isready >/dev/null 2>&1; then
    #   if pg_isready --host="${PGHOST}" --port="${PGPORT}" --username="${PGUSER}" >/dev/null 2>&1; then
    #     echo "✅ Postgres is ready."
    #     return 0
    #   fi
    # fi
    i=$((i+1))
    sleep 2
  done
  echo "❌ Database not reachable after waiting."
  exit 1
}

# ---- ensure prisma client exists ----
ensure_prisma_client() {
  # if [ ! -d "$CLIENT_DIR" ] || [ -z "$(ls -A "$CLIENT_DIR" 2>/dev/null || true)" ]; then
  #   echo "🔧 Prisma Client not found at $CLIENT_DIR → generating..."
  #   npx prisma generate --schema "$PRISMA_SCHEMA_PATH"
  # else
  #   echo "✅ Prisma Client found at $CLIENT_DIR"
  # fi
  echo "🔧 Running prisma generate..."
  npx prisma generate --schema "$PRISMA_SCHEMA_PATH"
}

apply_schema_dev() {
  case "${PRISMA_DEV_APPLY:-push}" in
    migrate)
      echo "🧪 DEV: applying schema via migrate dev..."
      if [ ! -d "$MIGRATIONS_DIR" ] || [ -z "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null)" ]; then
        NAME="${PRISMA_MIGRATION_NAME:-init}"
      else
        NAME="${PRISMA_MIGRATION_NAME:-auto}"
      fi
      npx prisma migrate dev --schema "$PRISMA_SCHEMA_PATH" --name "$NAME"
      ;;
    push|*)
      echo "🧪 DEV: applying schema via db push..."
      npx prisma db push --schema "$PRISMA_SCHEMA_PATH"
      ;;
  esac
}

apply_schema_prod() {
  if [ -d "$MIGRATIONS_DIR" ] && [ "$(ls -A "$MIGRATIONS_DIR" 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "🚀 PROD: applying migrations via migrate deploy..."
    npx prisma migrate deploy --schema "$PRISMA_SCHEMA_PATH"
  else
    echo "⚠️  PROD: no migrations folder or it's empty."
    if [ "$ALLOW_DB_PUSH_IN_PROD" = "true" ]; then
      echo "➡️  Fallback enabled (ALLOW_DB_PUSH_IN_PROD=true): running db push..."
      npx prisma db push --schema "$PRISMA_SCHEMA_PATH"
    else
      echo "⏭️  Skipping db push fallback in PROD. Set ALLOW_DB_PUSH_IN_PROD=true to allow."
    fi
  fi
}

ensure_shadow_db() {
  [ -n "${SHADOW_DATABASE_URL:-}" ] || return 0
  dbname="${SHADOW_DATABASE_URL##*/}"; dbname="${dbname%%[?]*}"

  # ถ้ายังต่อ shadow DB ไม่ได้ → สร้าง DB ก่อน
  if ! echo "SELECT 1;" | npx prisma db execute --stdin --url "$SHADOW_DATABASE_URL" >/dev/null 2>&1; then
    psql_admin -c "CREATE DATABASE \"$dbname\";"
    echo "✅ created shadow DB $dbname"
  fi

  # ติดตั้ง pgvector ใน shadow DB
  echo "CREATE EXTENSION IF NOT EXISTS vector;" \
    | npx prisma db execute --stdin --url "$SHADOW_DATABASE_URL" >/dev/null \
    && echo "🔧 pgvector ready on shadow"
}

ensure_pgvector() {
  # ติดตั้ง pgvector ใน DB หลัก
  echo "CREATE EXTENSION IF NOT EXISTS vector;" \
    | npx prisma db execute --stdin --url "$DATABASE_URL" >/dev/null \
    && echo "🔧 pgvector ready on main DB"
}

verify_pgvector() {
  for URL in "${DATABASE_URL:-}" "${SHADOW_DATABASE_URL:-}"; do
    [ -n "$URL" ] || continue
    echo "SELECT extname, extversion FROM pg_extension WHERE extname='vector';" \
      | npx prisma db execute --stdin --url "$URL" >/dev/null 2>&1 \
      && echo "🔎 vector is installed on ${URL##*@}"
  done
}

psql_admin() {
  if [ -n "${DB_ADMIN_URL:-}" ]; then
    psql --dbname="$DB_ADMIN_URL" -v ON_ERROR_STOP=1 "$@"
  else
    # fallback ถ้าไม่ได้ตั้ง DB_ADMIN_URL
    local fallback="${DATABASE_URL%/*}/postgres"
    psql --dbname="$fallback" -v ON_ERROR_STOP=1 "$@"
  fi
}

# ---- run ----
ensure_dev_deps
wait_for_db
ensure_shadow_db
ensure_pgvector
ensure_prisma_client
verify_pgvector

# echo "log_statement = 'ddl'" >> "$PGDATA/postgresql.conf" && pg_ctl -D "$PGDATA" reload

if [ "${DEBUG_PSQL:-0}" = "1" ]; then
  main_db="${DATABASE_URL##*/}";  main_db="${main_db%%\?*}"
  shadow_db="${SHADOW_DATABASE_URL##*/}"; shadow_db="${shadow_db%%\?*}"
  psql_admin -d "$main_db"   -c "SELECT current_user, version();" || true
  psql_admin -d "$main_db"   -c "\dx" || true
  psql_admin -d "$shadow_db" -c "\dx" || true
fi


if [ "$NODE_ENV" = "production" ]; then
  apply_schema_prod
  exec node dist/main.js
else
  apply_schema_dev
  exec npm run dev
fi
