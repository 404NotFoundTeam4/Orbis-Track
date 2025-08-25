#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:=postgres}"

# รอ postgres ของขั้น init ตื่น (entrypoint จะสตาร์ตชั่วคราวให้เรา)
# ปกติไม่จำเป็น แต่กันไว้ปลอดภัย
i=0; until psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "SELECT 1" >/dev/null 2>&1; do
  i=$((i+1)); [ $i -gt 30 ] && { echo "DB not ready"; exit 1; }
  sleep 1
done

# ถ้ายังไม่มี shadow DB ให้สร้าง
EXISTS="$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc \
  "SELECT 1 FROM pg_database WHERE datname='orbis_track_shadow'")"
if [ "$EXISTS" != "1" ]; then
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
    -c "CREATE DATABASE orbis_track_shadow;"
fi

# ลง pgvector ใน shadow
psql -U "$POSTGRES_USER" -d orbis_track_shadow -v ON_ERROR_STOP=1 \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
