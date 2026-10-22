ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS preparing_at timestamptz,
  ADD COLUMN IF NOT EXISTS ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE OR REPLACE FUNCTION private.order_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  -- Timestamps are system-managed: keep old values unless the status transitions now.
  NEW.accepted_at := OLD.accepted_at; NEW.preparing_at := OLD.preparing_at;
  NEW.ready_at := OLD.ready_at; NEW.picked_up_at := OLD.picked_up_at;
  NEW.cancelled_at := OLD.cancelled_at; NEW.delivered_at := OLD.delivered_at;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    CASE NEW.status
      WHEN 'accepted' THEN NEW.accepted_at := now();
      WHEN 'preparing' THEN NEW.preparing_at := now();
      WHEN 'ready' THEN NEW.ready_at := now();
      WHEN 'picked_up' THEN NEW.picked_up_at := now();
      WHEN 'delivered' THEN NEW.delivered_at := now();
      WHEN 'cancelled' THEN NEW.cancelled_at := now();
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION private.order_insert_times()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  NEW.accepted_at := NULL; NEW.preparing_at := NULL; NEW.picked_up_at := NULL;
  NEW.cancelled_at := NULL; NEW.delivered_at := NULL;
  NEW.ready_at := CASE WHEN NEW.status = 'ready' THEN now() ELSE NULL END;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS orders_insert_times ON public.orders;
CREATE TRIGGER orders_insert_times BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION private.order_insert_times();