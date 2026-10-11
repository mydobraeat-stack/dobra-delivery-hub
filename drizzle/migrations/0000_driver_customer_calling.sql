-- Recipient phone for package deliveries: readable only through the call function / staff.
CREATE TABLE public.order_contacts (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.order_contacts TO authenticated;
GRANT SELECT ON public.order_contacts TO authenticated;
GRANT ALL ON public.order_contacts TO service_role;
ALTER TABLE public.order_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customer adds contact for own order" ON public.order_contacts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "Staff read order contacts" ON public.order_contacts
  FOR SELECT TO authenticated USING (private.is_staff());

-- Call tap log for dispute handling.
CREATE TABLE public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  caller_id uuid NOT NULL,
  caller_role text NOT NULL,
  callee_role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX call_logs_order_idx ON public.call_logs(order_id);
GRANT SELECT ON public.call_logs TO authenticated;
GRANT ALL ON public.call_logs TO service_role;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read call logs" ON public.call_logs
  FOR SELECT TO authenticated USING (private.is_staff());

-- Phone format: international, e.g. +48600000000.
CREATE OR REPLACE FUNCTION public.validate_profile_phone()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.phone IS NOT NULL AND NEW.phone IS DISTINCT FROM OLD.phone THEN
    NEW.phone := regexp_replace(NEW.phone, '[\s\-().]', '', 'g');
    IF NEW.phone = '' THEN NEW.phone := NULL;
    ELSIF NEW.phone !~ '^\+[1-9][0-9]{7,14}$' THEN
      RAISE EXCEPTION 'invalid_phone' USING HINT = 'Use international format, e.g. +48 600 000 000';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_validate_phone BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_phone();

-- Drivers need a phone number before going online.
CREATE OR REPLACE FUNCTION public.require_driver_phone()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('available','busy')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status)
     AND OLD IS DISTINCT FROM NULL OR (TG_OP = 'INSERT' AND NEW.status IN ('available','busy')) THEN
    IF NEW.status IN ('available','busy') AND NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = NEW.id AND p.phone IS NOT NULL AND p.phone <> ''
    ) THEN
      RAISE EXCEPTION 'phone_required';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER drivers_require_phone BEFORE INSERT OR UPDATE OF status ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.require_driver_phone();

-- Which call buttons can work (booleans only, never the number).
CREATE OR REPLACE FUNCTION public.call_availability(_order uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE o record; uid uuid := auth.uid();
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order;
  IF o IS NULL OR o.driver_id IS NULL OR o.status IN ('delivered','cancelled') THEN
    RETURN jsonb_build_object('active', false);
  END IF;
  IF uid <> o.customer_id AND uid <> o.driver_id AND NOT private.is_staff() THEN
    RETURN jsonb_build_object('active', false);
  END IF;
  RETURN jsonb_build_object(
    'active', true,
    'driver', EXISTS (SELECT 1 FROM profiles WHERE id = o.driver_id AND coalesce(phone,'') <> ''),
    'customer', EXISTS (SELECT 1 FROM profiles WHERE id = o.customer_id AND coalesce(phone,'') <> ''),
    'recipient', EXISTS (SELECT 1 FROM order_contacts WHERE order_id = o.id AND coalesce(recipient_phone,'') <> '')
  );
END $$;

-- Returns the other party's number only to that order's customer/driver while active (or staff), and logs it.
CREATE OR REPLACE FUNCTION public.get_call_number(_order uuid, _target text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o record; uid uuid := auth.uid(); role text; num text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_allowed'; END IF;
  SELECT * INTO o FROM public.orders WHERE id = _order;
  IF o IS NULL THEN RAISE EXCEPTION 'not_allowed'; END IF;
  IF private.is_staff() THEN role := 'staff';
  ELSIF o.driver_id IS NULL OR o.status IN ('delivered','cancelled') THEN RAISE EXCEPTION 'not_allowed';
  ELSIF uid = o.customer_id AND _target = 'driver' THEN role := 'customer';
  ELSIF uid = o.driver_id AND _target IN ('customer','recipient') THEN role := 'driver';
  ELSE RAISE EXCEPTION 'not_allowed';
  END IF;

  IF _target = 'driver' THEN SELECT phone INTO num FROM profiles WHERE id = o.driver_id;
  ELSIF _target = 'customer' THEN SELECT phone INTO num FROM profiles WHERE id = o.customer_id;
  ELSIF _target = 'recipient' THEN SELECT recipient_phone INTO num FROM order_contacts WHERE order_id = o.id;
  ELSE RAISE EXCEPTION 'not_allowed';
  END IF;

  IF coalesce(num,'') = '' THEN RETURN NULL; END IF;
  INSERT INTO call_logs(order_id, caller_id, caller_role, callee_role) VALUES (o.id, uid, role, _target);
  RETURN num;
END $$;

REVOKE ALL ON FUNCTION public.call_availability(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_call_number(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.call_availability(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_call_number(uuid, text) TO authenticated;

-- Retention: call logs are deleted 12 months after the call.
CREATE OR REPLACE FUNCTION public.purge_old_call_logs()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.call_logs WHERE created_at < now() - interval '12 months';
$$;
REVOKE ALL ON FUNCTION public.purge_old_call_logs() FROM PUBLIC, anon, authenticated;
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('purge-call-logs', '17 3 * * *', 'SELECT public.purge_old_call_logs()');