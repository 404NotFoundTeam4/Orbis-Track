-- RAG NOTIFY triggers for chatbot embedding refresh
-- Safe OLD/NEW handling: never touch OLD on INSERT, never touch NEW on DELETE.

CREATE OR REPLACE FUNCTION notify_rag_update()
RETURNS TRIGGER AS $$
DECLARE
    pk_val INT;
    meaningful_change BOOLEAN := FALSE;
BEGIN
    -- Identify record PK by table + action (must avoid cross-table field access)
    IF TG_TABLE_NAME = 'devices' THEN
        IF TG_OP = 'DELETE' THEN pk_val := OLD.de_id; ELSE pk_val := NEW.de_id; END IF;
    ELSIF TG_TABLE_NAME = 'device_childs' THEN
        IF TG_OP = 'DELETE' THEN pk_val := OLD.dec_id; ELSE pk_val := NEW.dec_id; END IF;
    ELSIF TG_TABLE_NAME = 'categories' THEN
        IF TG_OP = 'DELETE' THEN pk_val := OLD.ca_id; ELSE pk_val := NEW.ca_id; END IF;
    ELSIF TG_TABLE_NAME = 'borrow_return_tickets' THEN
        IF TG_OP = 'DELETE' THEN pk_val := OLD.brt_id; ELSE pk_val := NEW.brt_id; END IF;
    ELSIF TG_TABLE_NAME = 'ticket_issues' THEN
        IF TG_OP = 'DELETE' THEN pk_val := OLD.ti_id; ELSE pk_val := NEW.ti_id; END IF;
    ELSE
        pk_val := NULL;
    END IF;

    IF pk_val IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- INSERT / DELETE always considered meaningful
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        meaningful_change := TRUE;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update-specific meaningful checks by table
        IF TG_TABLE_NAME = 'devices' THEN
            meaningful_change :=
                OLD.de_name IS DISTINCT FROM NEW.de_name OR
                OLD.de_description IS DISTINCT FROM NEW.de_description OR
                OLD.de_location IS DISTINCT FROM NEW.de_location OR
                OLD.de_ca_id IS DISTINCT FROM NEW.de_ca_id OR
                OLD.de_sec_id IS DISTINCT FROM NEW.de_sec_id OR
                OLD.de_af_id IS DISTINCT FROM NEW.de_af_id;
        ELSIF TG_TABLE_NAME = 'device_childs' THEN
            meaningful_change :=
                OLD.dec_asset_code IS DISTINCT FROM NEW.dec_asset_code OR
                OLD.dec_serial_number IS DISTINCT FROM NEW.dec_serial_number OR
                OLD.dec_status IS DISTINCT FROM NEW.dec_status OR
                OLD.dec_de_id IS DISTINCT FROM NEW.dec_de_id;
        ELSIF TG_TABLE_NAME = 'categories' THEN
            meaningful_change := OLD.ca_name IS DISTINCT FROM NEW.ca_name;
        ELSIF TG_TABLE_NAME = 'borrow_return_tickets' THEN
            meaningful_change :=
                OLD.brt_status IS DISTINCT FROM NEW.brt_status OR
                OLD.brt_user_id IS DISTINCT FROM NEW.brt_user_id OR
                OLD.brt_start_date IS DISTINCT FROM NEW.brt_start_date OR
                OLD.brt_end_date IS DISTINCT FROM NEW.brt_end_date OR
                OLD.brt_af_id IS DISTINCT FROM NEW.brt_af_id;
        ELSIF TG_TABLE_NAME = 'ticket_issues' THEN
            meaningful_change :=
                OLD.ti_title IS DISTINCT FROM NEW.ti_title OR
                OLD.ti_description IS DISTINCT FROM NEW.ti_description OR
                OLD.ti_status IS DISTINCT FROM NEW.ti_status OR
                OLD.ti_result IS DISTINCT FROM NEW.ti_result OR
                OLD.ti_resolved_note IS DISTINCT FROM NEW.ti_resolved_note OR
                OLD.ti_de_id IS DISTINCT FROM NEW.ti_de_id OR
                OLD.ti_brt_id IS DISTINCT FROM NEW.ti_brt_id;
        END IF;
    END IF;

    IF meaningful_change THEN
        PERFORM pg_notify(
            'rag_update',
            json_build_object(
                'table', TG_TABLE_NAME,
                'pk', pk_val,
                'action', TG_OP
            )::text
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- devices
DROP TRIGGER IF EXISTS trg_rag_devices ON devices;
DROP TRIGGER IF EXISTS trg_rag_devices_update ON devices;
CREATE TRIGGER trg_rag_devices
AFTER INSERT OR DELETE ON devices
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();
CREATE TRIGGER trg_rag_devices_update
AFTER UPDATE OF de_name, de_description, de_location, de_ca_id, de_sec_id, de_af_id ON devices
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();

-- device_childs
DROP TRIGGER IF EXISTS trg_rag_device_childs ON device_childs;
DROP TRIGGER IF EXISTS trg_rag_device_childs_update ON device_childs;
CREATE TRIGGER trg_rag_device_childs
AFTER INSERT OR DELETE ON device_childs
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();
CREATE TRIGGER trg_rag_device_childs_update
AFTER UPDATE OF dec_asset_code, dec_serial_number, dec_status, dec_de_id ON device_childs
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();

-- categories
DROP TRIGGER IF EXISTS trg_rag_categories ON categories;
DROP TRIGGER IF EXISTS trg_rag_categories_update ON categories;
CREATE TRIGGER trg_rag_categories
AFTER INSERT OR DELETE ON categories
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();
CREATE TRIGGER trg_rag_categories_update
AFTER UPDATE OF ca_name ON categories
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();

-- borrow_return_tickets
DROP TRIGGER IF EXISTS trg_rag_tickets ON borrow_return_tickets;
DROP TRIGGER IF EXISTS trg_rag_tickets_update ON borrow_return_tickets;
CREATE TRIGGER trg_rag_tickets
AFTER INSERT OR DELETE ON borrow_return_tickets
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();
CREATE TRIGGER trg_rag_tickets_update
AFTER UPDATE OF brt_status, brt_user_id, brt_start_date, brt_end_date, brt_af_id ON borrow_return_tickets
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();

-- ticket_issues
DROP TRIGGER IF EXISTS trg_rag_issues ON ticket_issues;
DROP TRIGGER IF EXISTS trg_rag_issues_update ON ticket_issues;
CREATE TRIGGER trg_rag_issues
AFTER INSERT OR DELETE ON ticket_issues
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();
CREATE TRIGGER trg_rag_issues_update
AFTER UPDATE OF ti_title, ti_description, ti_status, ti_result, ti_resolved_note, ti_de_id, ti_brt_id ON ticket_issues
FOR EACH ROW
EXECUTE FUNCTION notify_rag_update();

SELECT 'RAG triggers enabled' as notice;