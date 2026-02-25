# แผนการแก้ไขปัญหา Trigger "column old does not exist"

## ปัญหาที่พบ

1. **Prisma Migration** (`20260223134000_rag_notify_triggers/migration.sql`): ฟังก์ชัน `notify_rag_update()` เรียกใช้ `OLD.id` และ `NEW.id` แต่ตารางไม่มีคอลัมน์ `id` (มีแต่ `ca_id`, `de_id`, etc.)

2. **Docker Init Script** (`002-rag-triggers.sql`): ฟังก์ชันใช้ `OLD.column` ร่วมกับ `TG_OP = 'INSERT'` ในเงื่อนไขเดียวกัน ทำให้ PostgreSQL พยายามเข้าถึง `OLD` ตอน INSERT

## ไฟล์ที่แก้ไขแล้ว

### 1. server/src/infrastructure/database/prisma/migrations/20260223134000_rag_notify_triggers/migration.sql

**ปัญหาเดิม:**

```sql
pk_val := CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END;
```

**แก้ไขเป็น:**

```sql
pk_val := CASE TG_TABLE_NAME
  WHEN 'devices' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.de_id ELSE NEW.de_id END
  WHEN 'device_childs' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.dec_id ELSE NEW.dec_id END
  WHEN 'categories' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.ca_id ELSE NEW.ca_id END
  WHEN 'borrow_return_tickets' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.brt_id ELSE NEW.brt_id END
  WHEN 'ticket_issues' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.ti_id ELSE NEW.ti_id END
END;
```

### 2. docker/db-init/002-rag-triggers.sql

**ปัญหาเดิม:**

```sql
IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.column IS DISTINCT FROM NEW.column) THEN
```

**แก้ไขเป็น:**

```sql
IF TG_OP = 'INSERT' THEN
    meaningful_change := TRUE;
ELSIF TG_OP = 'UPDATE' AND OLD.column IS DISTINCT FROM NEW.column THEN
    meaningful_change := TRUE;
END IF;
```

## ขั้นตอนการ apply การแก้ไข

### สำหรับ Database ใหม่ (สร้างจากศูนย์):

```bash
docker compose down -v
docker volume rm orbis-track_pgdbdata
docker compose up -d
```

### สำหรับ Database ที่มีอยู่แล้ว (ไม่ต้องการลบข้อมูล):

```bash
# 1. เข้าไปใน backend container
docker compose exec backend sh

# 2. อัปเดตฟังก์ชัน trigger
psql $DATABASE_URL -c "
CREATE OR REPLACE FUNCTION notify_rag_update()
RETURNS TRIGGER AS \$\$
DECLARE
  pk_val INT;
BEGIN
  pk_val := CASE TG_TABLE_NAME
    WHEN 'devices' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.de_id ELSE NEW.de_id END
    WHEN 'device_childs' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.dec_id ELSE NEW.dec_id END
    WHEN 'categories' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.ca_id ELSE NEW.ca_id END
    WHEN 'borrow_return_tickets' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.brt_id ELSE NEW.brt_id END
    WHEN 'ticket_issues' THEN CASE TG_OP WHEN 'DELETE' THEN OLD.ti_id ELSE NEW.ti_id END
  END;
  PERFORM pg_notify('rag_update', json_build_object('table', TG_TABLE_NAME, 'pk', pk_val, 'action', TG_OP)::text);
  RETURN COALESCE(NEW, OLD);
END;
\$\$ LANGUAGE plpgsql;
"

# 3. รัน seed
node ./dist/infrastructure/database/prisma/seed.js
```

## บทเรียนที่ได้

1. **ตรวจสอบชื่อ Primary Key**: อย่าสมมติว่าทุกตารางมีคอลัมน์ `id` - ต้องเช็ค schema จริง
2. **Trigger Logic**: อย่าใช้ `OLD` ร่วมกับ `INSERT` ในเงื่อนไขเดียวกัน แม้จะมี short-circuit
3. **Migration Testing**: ควรทดสอบ migration บน database ว่างก่อน deploy จริง
