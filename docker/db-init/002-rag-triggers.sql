-- ============================================================================
-- RAG Data Freshness Triggers for Orbis-Track + Chatbot Integration
-- Description: Triggers to send NOTIFY events when knowledge base tables change
-- Purpose: Enable Chatbot RAG Worker to update embeddings incrementally
-- Tables: devices, device_childs, categories, borrow_return_tickets, ticket_issues
-- ============================================================================

-- Create function to send rag_update notification for INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.notify_rag_update()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
    meaningful_change BOOLEAN := FALSE;
    pk_value TEXT;
BEGIN
    -- Get primary key value based on table
    IF TG_TABLE_NAME = 'devices' THEN
        pk_value := NEW.de_id::text;
        -- For devices, watch: name, description, location, category, section
        IF TG_OP = 'INSERT' THEN
            meaningful_change := TRUE;
        ELSIF TG_OP = 'UPDATE' AND (
            OLD.de_name IS DISTINCT FROM NEW.de_name OR
            OLD.de_description IS DISTINCT FROM NEW.de_description OR
            OLD.de_location IS DISTINCT FROM NEW.de_location OR
            OLD.de_ca_id IS DISTINCT FROM NEW.de_ca_id OR
            OLD.de_sec_id IS DISTINCT FROM NEW.de_sec_id OR
            OLD.de_af_id IS DISTINCT FROM NEW.de_af_id
        ) THEN
            meaningful_change := TRUE;
        END IF;

    ELSIF TG_TABLE_NAME = 'device_childs' THEN
        pk_value := NEW.dec_id::text;
        -- For device_childs, watch: asset_code, serial_number, status
        IF TG_OP = 'INSERT' THEN
            meaningful_change := TRUE;
        ELSIF TG_OP = 'UPDATE' AND (
            OLD.dec_asset_code IS DISTINCT FROM NEW.dec_asset_code OR
            OLD.dec_serial_number IS DISTINCT FROM NEW.dec_serial_number OR
            OLD.dec_status IS DISTINCT FROM NEW.dec_status OR
            OLD.dec_de_id IS DISTINCT FROM NEW.dec_de_id
        ) THEN
            meaningful_change := TRUE;
        END IF;

    ELSIF TG_TABLE_NAME = 'categories' THEN
        pk_value := NEW.ca_id::text;
        -- For categories, watch: name
        IF TG_OP = 'INSERT' THEN
            meaningful_change := TRUE;
        ELSIF TG_OP = 'UPDATE' AND OLD.ca_name IS DISTINCT FROM NEW.ca_name THEN
            meaningful_change := TRUE;
        END IF;

    ELSIF TG_TABLE_NAME = 'borrow_return_tickets' THEN
        pk_value := NEW.brt_id::text;
        -- For borrow_return_tickets, watch: status, dates, user
        IF TG_OP = 'INSERT' THEN
            meaningful_change := TRUE;
        ELSIF TG_OP = 'UPDATE' AND (
            OLD.brt_status IS DISTINCT FROM NEW.brt_status OR
            OLD.brt_user_id IS DISTINCT FROM NEW.brt_user_id OR
            OLD.brt_start_date IS DISTINCT FROM NEW.brt_start_date OR
            OLD.brt_end_date IS DISTINCT FROM NEW.brt_end_date OR
            OLD.brt_af_id IS DISTINCT FROM NEW.brt_af_id
        ) THEN
            meaningful_change := TRUE;
        END IF;

    ELSIF TG_TABLE_NAME = 'ticket_issues' THEN
        pk_value := NEW.ti_id::text;
        -- For ticket_issues, watch: title, description, status, result, resolution
        IF TG_OP = 'INSERT' THEN
            meaningful_change := TRUE;
        ELSIF TG_OP = 'UPDATE' AND (
            OLD.ti_title IS DISTINCT FROM NEW.ti_title OR
            OLD.ti_description IS DISTINCT FROM NEW.ti_description OR
            OLD.ti_status IS DISTINCT FROM NEW.ti_status OR
            OLD.ti_result IS DISTINCT FROM NEW.ti_result OR
            OLD.ti_resolved_note IS DISTINCT FROM NEW.ti_resolved_note OR
            OLD.ti_de_id IS DISTINCT FROM NEW.ti_de_id OR
            OLD.ti_brt_id IS DISTINCT FROM NEW.ti_brt_id
        ) THEN
            meaningful_change := TRUE;
        END IF;
    END IF;

    -- Send notification if relevant
    IF meaningful_change THEN
        payload := json_build_object(
            'table', TG_TABLE_NAME,
            'pk', pk_value,
            'action', TG_OP,
            'timestamp', extract(epoch from now())
        );
        PERFORM pg_notify('rag_update', payload::text);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function for DELETE operations (uses OLD instead of NEW)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.notify_rag_update_delete()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
    pk_value TEXT;
BEGIN
    -- Get primary key value from OLD record
    IF TG_TABLE_NAME = 'devices' THEN
        pk_value := OLD.de_id::text;
    ELSIF TG_TABLE_NAME = 'device_childs' THEN
        pk_value := OLD.dec_id::text;
    ELSIF TG_TABLE_NAME = 'categories' THEN
        pk_value := OLD.ca_id::text;
    ELSIF TG_TABLE_NAME = 'borrow_return_tickets' THEN
        pk_value := OLD.brt_id::text;
    ELSIF TG_TABLE_NAME = 'ticket_issues' THEN
        pk_value := OLD.ti_id::text;
    ELSE
        pk_value := 'unknown';
    END IF;

    -- Build payload
    payload := json_build_object(
        'table', TG_TABLE_NAME,
        'pk', pk_value,
        'action', 'DELETE',
        'timestamp', extract(epoch from now())
    );

    -- Send notification
    PERFORM pg_notify('rag_update', payload::text);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON FUNCTION public.notify_rag_update() IS 'Trigger function to notify on INSERT/UPDATE for RAG updates';
COMMENT ON FUNCTION public.notify_rag_update_delete() IS 'Trigger function for DELETE operations on RAG-tracked tables';

-- ============================================================================
-- Create RAG Triggers (with existence checks)
-- ============================================================================

-- Devices table triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'devices') THEN
        
        DROP TRIGGER IF EXISTS rag_update_devices ON public.devices;
        DROP TRIGGER IF EXISTS rag_update_devices_delete ON public.devices;
        
        CREATE TRIGGER rag_update_devices
            AFTER INSERT OR UPDATE ON public.devices
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update();
            
        CREATE TRIGGER rag_update_devices_delete
            AFTER DELETE ON public.devices
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update_delete();
            
        RAISE NOTICE 'Created RAG triggers for devices table';
    END IF;
END $$;

-- Device childs table triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'device_childs') THEN
        
        DROP TRIGGER IF EXISTS rag_update_device_childs ON public.device_childs;
        DROP TRIGGER IF EXISTS rag_update_device_childs_delete ON public.device_childs;
        
        CREATE TRIGGER rag_update_device_childs
            AFTER INSERT OR UPDATE ON public.device_childs
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update();
            
        CREATE TRIGGER rag_update_device_childs_delete
            AFTER DELETE ON public.device_childs
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update_delete();
            
        RAISE NOTICE 'Created RAG triggers for device_childs table';
    END IF;
END $$;

-- Categories table triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'categories') THEN
        
        DROP TRIGGER IF EXISTS rag_update_categories ON public.categories;
        DROP TRIGGER IF EXISTS rag_update_categories_delete ON public.categories;
        
        CREATE TRIGGER rag_update_categories
            AFTER INSERT OR UPDATE ON public.categories
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update();
            
        CREATE TRIGGER rag_update_categories_delete
            AFTER DELETE ON public.categories
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update_delete();
            
        RAISE NOTICE 'Created RAG triggers for categories table';
    END IF;
END $$;

-- Borrow return tickets table triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'borrow_return_tickets') THEN
        
        DROP TRIGGER IF EXISTS rag_update_borrow_return_tickets ON public.borrow_return_tickets;
        DROP TRIGGER IF EXISTS rag_update_borrow_return_tickets_delete ON public.borrow_return_tickets;
        
        CREATE TRIGGER rag_update_borrow_return_tickets
            AFTER INSERT OR UPDATE ON public.borrow_return_tickets
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update();
            
        CREATE TRIGGER rag_update_borrow_return_tickets_delete
            AFTER DELETE ON public.borrow_return_tickets
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update_delete();
            
        RAISE NOTICE 'Created RAG triggers for borrow_return_tickets table';
    END IF;
END $$;

-- Ticket issues table triggers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'ticket_issues') THEN
        
        DROP TRIGGER IF EXISTS rag_update_ticket_issues ON public.ticket_issues;
        DROP TRIGGER IF EXISTS rag_update_ticket_issues_delete ON public.ticket_issues;
        
        CREATE TRIGGER rag_update_ticket_issues
            AFTER INSERT OR UPDATE ON public.ticket_issues
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update();
            
        CREATE TRIGGER rag_update_ticket_issues_delete
            AFTER DELETE ON public.ticket_issues
            FOR EACH ROW
            EXECUTE FUNCTION public.notify_rag_update_delete();
            
        RAISE NOTICE 'Created RAG triggers for ticket_issues table';
    END IF;
END $$;

-- ============================================================================
-- Verification query (can be run to check triggers)
-- ============================================================================
-- SELECT * FROM pg_trigger WHERE tgname LIKE 'rag_update_%';
