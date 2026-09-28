
-- ============ helpers ============
CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','support_agent'));
$$;

-- ============ columns ============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason text;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS commission_rate numeric;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_status text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_fee numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

CREATE OR REPLACE FUNCTION private.is_active(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE((SELECT account_status = 'active' FROM public.profiles WHERE id = _uid), true);
$$;

-- ============ tables ============
CREATE TABLE public.platform_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance_mode boolean NOT NULL DEFAULT false,
  maintenance_message text NOT NULL DEFAULT 'We''ll be right back. Dobra is getting a quick update.',
  late_threshold_minutes int NOT NULL DEFAULT 30,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads platform settings" ON public.platform_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
INSERT INTO public.platform_settings (id) VALUES (1);

CREATE TABLE public.country_pricing (
  country text PRIMARY KEY,
  currency text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  commission_pct numeric NOT NULL DEFAULT 15,
  service_fee numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  package_base_fee numeric NOT NULL DEFAULT 0,
  package_per_km numeric NOT NULL DEFAULT 0,
  package_min_fee numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.country_pricing TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.country_pricing TO authenticated;
GRANT ALL ON public.country_pricing TO service_role;
ALTER TABLE public.country_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads pricing" ON public.country_pricing FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins manage pricing" ON public.country_pricing FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
INSERT INTO public.country_pricing (country,currency,enabled,commission_pct,service_fee,delivery_fee,min_order,package_base_fee,package_per_km,package_min_fee) VALUES
 ('Poland','PLN',true,15,1.99,7.99,20,12,2.5,12),
 ('Cameroon','XAF',false,15,300,1000,3000,1500,300,1500);

CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  delivery_fee_override numeric,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads cities" ON public.cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins manage cities" ON public.cities FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
INSERT INTO public.cities (name,country,lat,lng,sort) VALUES
 ('Warsaw','Poland',52.2297,21.0122,1),('Kraków','Poland',50.0647,19.945,2),('Gdańsk','Poland',54.352,18.6466,3),
 ('Wrocław','Poland',51.1079,17.0385,4),('Poznań','Poland',52.4064,16.9252,5),('Lublin','Poland',51.2465,22.5684,6),
 ('Lutynia','Poland',51.1247,16.7472,7),('Miękinia','Poland',51.1622,16.7686,8),
 ('Yaoundé','Cameroon',3.848,11.5021,1),('Douala','Cameroon',4.0511,9.7679,2),('Bafoussam','Cameroon',5.4768,10.4176,3);

CREATE TABLE public.order_admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_admin_notes TO authenticated;
GRANT ALL ON public.order_admin_notes TO service_role;
ALTER TABLE public.order_admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read notes" ON public.order_admin_notes FOR SELECT TO authenticated USING (private.is_staff());

CREATE TABLE public.order_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'complaint',
  description text,
  status text NOT NULL DEFAULT 'open',
  created_by uuid,
  resolved_by uuid,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT ON public.order_disputes TO authenticated;
GRANT ALL ON public.order_disputes TO service_role;
ALTER TABLE public.order_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read disputes" ON public.order_disputes FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Customers read own complaints" ON public.order_disputes FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Customers report problems on own orders" ON public.order_disputes FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND kind = 'complaint' AND status = 'open'
    AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read audit log" ON public.admin_audit_log FOR SELECT TO authenticated USING (private.is_platform_admin());

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  amount numeric NOT NULL CHECK (amount > 0),
  usage_limit int,
  per_user_limit int,
  expires_at timestamptz,
  min_order numeric NOT NULL DEFAULT 0,
  country text,
  active boolean NOT NULL DEFAULT true,
  uses int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage promos" ON public.promo_codes FOR ALL TO authenticated USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());

CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read redemptions" ON public.promo_redemptions FOR SELECT TO authenticated USING (private.is_platform_admin());

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_role text,
  target_country text,
  recipients int NOT NULL DEFAULT 0,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins read announcements" ON public.announcements FOR SELECT TO authenticated USING (private.is_platform_admin());

-- ============ staff visibility (support agents) ============
CREATE POLICY "Staff view all orders" ON public.orders FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all restaurants" ON public.restaurants FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all order items" ON public.order_items FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all drivers" ON public.drivers FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Staff view all menu items" ON public.menu_items FOR SELECT TO authenticated USING (private.is_staff());
CREATE POLICY "Admins view memberships" ON public.prime_memberships FOR SELECT TO authenticated USING (private.is_platform_admin());

-- ============ suspended accounts are blocked ============
CREATE POLICY "Only active accounts create orders" ON public.orders AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.is_active(auth.uid()));
CREATE POLICY "Only active accounts update orders" ON public.orders AS RESTRICTIVE FOR UPDATE TO authenticated USING (private.is_active(auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_approval_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN
    NEW.approval_status := OLD.approval_status;
    NEW.account_status := OLD.account_status;
    NEW.suspension_reason := OLD.suspension_reason;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.prevent_restaurant_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN
    NEW.status := OLD.status;
    NEW.commission_rate := OLD.commission_rate;
    NEW.featured := OLD.featured;
  END IF;
  RETURN NEW;
END; $$;

-- ============ audit ============
CREATE OR REPLACE FUNCTION private.log_admin(_action text, _type text, _target text, _details jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, details)
  VALUES (auth.uid(), _action, _type, _target, COALESCE(_details, '{}'::jsonb));
$$;

CREATE OR REPLACE FUNCTION private.audit_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _id text;
BEGIN
  IF NOT private.is_staff() THEN RETURN COALESCE(NEW, OLD); END IF;
  _id := COALESCE(to_jsonb(NEW)->>'id', to_jsonb(OLD)->>'id', to_jsonb(NEW)->>'country', to_jsonb(OLD)->>'country');
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
      PERFORM private.log_admin('account_' || NEW.approval_status, 'user', _id, jsonb_build_object('name', NEW.full_name));
    END IF;
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'restaurants' THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.featured IS DISTINCT FROM OLD.featured OR NEW.commission_rate IS DISTINCT FROM OLD.commission_rate THEN
      PERFORM private.log_admin('restaurant_updated', 'restaurant', _id,
        jsonb_build_object('name', NEW.name, 'status', NEW.status, 'featured', NEW.featured, 'commission_rate', NEW.commission_rate));
    END IF;
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'driver_documents' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM private.log_admin('document_' || NEW.status, 'driver', NEW.driver_id::text, jsonb_build_object('doc_type', NEW.doc_type));
    END IF;
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'drivers' THEN
    IF NEW.docs_status IS DISTINCT FROM OLD.docs_status THEN
      PERFORM private.log_admin('driver_docs_' || NEW.docs_status, 'driver', _id, '{}'::jsonb);
    END IF;
    RETURN NEW;
  END IF;
  PERFORM private.log_admin(lower(TG_OP) || '_' || TG_TABLE_NAME, TG_TABLE_NAME, _id,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END);
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER audit_profiles AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_restaurants AFTER UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_driver_documents AFTER UPDATE ON public.driver_documents FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_drivers AFTER UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_platform_settings AFTER UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_country_pricing AFTER INSERT OR UPDATE OR DELETE ON public.country_pricing FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_cities AFTER INSERT OR UPDATE OR DELETE ON public.cities FOR EACH ROW EXECUTE FUNCTION private.audit_changes();
CREATE TRIGGER audit_promo_codes AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION private.audit_changes();

-- ============ order lifecycle helpers ============
CREATE OR REPLACE FUNCTION private.order_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    NEW.delivered_at := now();
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_lifecycle BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.order_lifecycle();

CREATE OR REPLACE FUNCTION private.order_auto_dispute()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled'
     AND OLD.driver_id IS NOT NULL AND NOT private.is_staff() THEN
    INSERT INTO public.order_disputes (order_id, kind, description, created_by)
    VALUES (NEW.id, 'cancelled_after_assign', 'Order was cancelled after a driver had been assigned.', auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_auto_dispute AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.order_auto_dispute();

-- ============ promo codes (server-validated) ============
CREATE OR REPLACE FUNCTION private.promo_discount(_code text, _user uuid, _subtotal numeric, _country text)
RETURNS TABLE (promo_id uuid, discount numeric) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE p public.promo_codes%ROWTYPE; _used int;
BEGIN
  SELECT * INTO p FROM public.promo_codes WHERE upper(code) = upper(trim(_code));
  IF p.id IS NULL OR NOT p.active THEN RAISE EXCEPTION 'This promo code is not valid.'; END IF;
  IF p.expires_at IS NOT NULL AND p.expires_at < now() THEN RAISE EXCEPTION 'This promo code has expired.'; END IF;
  IF p.usage_limit IS NOT NULL AND p.uses >= p.usage_limit THEN RAISE EXCEPTION 'This promo code has been fully used.'; END IF;
  IF p.country IS NOT NULL AND _country IS NOT NULL AND lower(p.country) <> lower(_country) THEN RAISE EXCEPTION 'This promo code is not available in your country.'; END IF;
  IF _subtotal < p.min_order THEN RAISE EXCEPTION 'Order total is below the minimum for this promo code (%).', p.min_order; END IF;
  IF p.per_user_limit IS NOT NULL THEN
    SELECT count(*) INTO _used FROM public.promo_redemptions r WHERE r.promo_id = p.id AND r.user_id = _user;
    IF _used >= p.per_user_limit THEN RAISE EXCEPTION 'You have already used this promo code.'; END IF;
  END IF;
  promo_id := p.id;
  discount := LEAST(_subtotal, ROUND(CASE WHEN p.discount_type = 'percent' THEN _subtotal * p.amount / 100 ELSE p.amount END, 2));
  RETURN NEXT;
END; $$;

CREATE OR REPLACE FUNCTION public.preview_promo(_code text, _subtotal numeric, _country text DEFAULT NULL)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT discount FROM private.promo_discount(_code, auth.uid(), _subtotal, _country);
$$;
REVOKE ALL ON FUNCTION public.preview_promo(text, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_promo(text, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION private.orders_apply_promo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _pid uuid; _disc numeric;
BEGIN
  NEW.refund_amount := 0; NEW.refund_status := NULL; NEW.cancel_reason := NULL;
  IF NEW.promo_code IS NULL OR trim(NEW.promo_code) = '' THEN
    NEW.promo_code := NULL; NEW.discount := 0;
    RETURN NEW;
  END IF;
  SELECT promo_id, discount INTO _pid, _disc FROM private.promo_discount(NEW.promo_code, NEW.customer_id, NEW.subtotal, NEW.country);
  NEW.promo_code := upper(trim(NEW.promo_code));
  NEW.discount := _disc;
  NEW.total := GREATEST(0, NEW.subtotal + NEW.delivery_fee + NEW.service_fee - _disc);
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_apply_promo BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION private.orders_apply_promo();

CREATE OR REPLACE FUNCTION private.orders_record_promo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _pid uuid;
BEGIN
  IF NEW.promo_code IS NULL THEN RETURN NEW; END IF;
  SELECT id INTO _pid FROM public.promo_codes WHERE upper(code) = NEW.promo_code;
  INSERT INTO public.promo_redemptions (promo_id, user_id, order_id, amount) VALUES (_pid, NEW.customer_id, NEW.id, NEW.discount);
  UPDATE public.promo_codes SET uses = uses + 1 WHERE id = _pid;
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_record_promo AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION private.orders_record_promo();

-- ============ admin actions ============
CREATE OR REPLACE FUNCTION public.admin_cancel_order(_order uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF coalesce(trim(_reason), '') = '' THEN RAISE EXCEPTION 'A reason is required'; END IF;
  UPDATE public.orders SET status = 'cancelled', cancel_reason = _reason WHERE id = _order;
  PERFORM private.log_admin('order_cancelled', 'order', _order::text, jsonb_build_object('reason', _reason));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_refund_order(_order uuid, _amount numeric, _reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE o public.orders%ROWTYPE; _status text; _pay text;
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO o FROM public.orders WHERE id = _order;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount + o.refund_amount > o.total THEN
    RAISE EXCEPTION 'Refund must be between 0 and the remaining order total (%)', o.total - o.refund_amount;
  END IF;
  IF o.payment_method = 'card' AND o.payment_status = 'paid' THEN
    _status := 'pending_card';
    _pay := o.payment_status;
  ELSE
    _status := CASE WHEN o.status = 'delivered' THEN 'refunded' ELSE 'voided' END;
    _pay := CASE WHEN _amount + o.refund_amount >= o.total THEN _status ELSE 'partially_refunded' END;
  END IF;
  UPDATE public.orders SET refund_amount = o.refund_amount + _amount, refund_status = _status, payment_status = _pay WHERE id = _order;
  PERFORM private.log_admin('order_refunded', 'order', _order::text,
    jsonb_build_object('amount', _amount, 'currency', o.currency, 'reason', _reason, 'refund_status', _status));
  RETURN _status;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_reassign_driver(_order uuid, _driver uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _driver IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = _driver AND ur.role = 'driver' AND p.approval_status = 'approved' AND p.account_status = 'active') THEN
    RAISE EXCEPTION 'That driver is not approved or is suspended';
  END IF;
  UPDATE public.orders SET driver_id = _driver WHERE id = _order;
  PERFORM private.log_admin(CASE WHEN _driver IS NULL THEN 'driver_unassigned' ELSE 'driver_reassigned' END,
    'order', _order::text, jsonb_build_object('driver_id', _driver));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_force_status(_order uuid, _status text, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _status NOT IN ('pending','accepted','preparing','ready','picked_up','delivered','cancelled') THEN RAISE EXCEPTION 'Unknown status'; END IF;
  IF coalesce(trim(_reason), '') = '' THEN RAISE EXCEPTION 'A reason is required'; END IF;
  UPDATE public.orders SET status = _status WHERE id = _order;
  PERFORM private.log_admin('order_status_forced', 'order', _order::text, jsonb_build_object('status', _status, 'reason', _reason));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_add_note(_order uuid, _body text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF coalesce(trim(_body), '') = '' THEN RAISE EXCEPTION 'Note is empty'; END IF;
  INSERT INTO public.order_admin_notes (order_id, author_id, body) VALUES (_order, auth.uid(), trim(_body));
  PERFORM private.log_admin('order_note_added', 'order', _order::text, '{}'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_flag_order(_order uuid, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  INSERT INTO public.order_disputes (order_id, kind, description, created_by) VALUES (_order, 'flagged', _note, auth.uid());
  PERFORM private.log_admin('order_flagged', 'order', _order::text, jsonb_build_object('note', _note));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_resolve_dispute(_id uuid, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  UPDATE public.order_disputes SET status = 'resolved', resolved_by = auth.uid(), resolved_at = now(), resolution_note = _note WHERE id = _id;
  PERFORM private.log_admin('dispute_resolved', 'dispute', _id::text, jsonb_build_object('note', _note));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(_user uuid, _status text, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
  IF _status NOT IN ('active','suspended','banned') THEN RAISE EXCEPTION 'Unknown status'; END IF;
  IF _status <> 'active' AND coalesce(trim(_reason), '') = '' THEN RAISE EXCEPTION 'A reason is required'; END IF;
  IF _user = auth.uid() THEN RAISE EXCEPTION 'You cannot suspend yourself'; END IF;
  UPDATE public.profiles SET account_status = _status, suspension_reason = CASE WHEN _status = 'active' THEN NULL ELSE _reason END WHERE id = _user;
  IF _status <> 'active' THEN UPDATE public.drivers SET status = 'offline' WHERE id = _user; END IF;
  PERFORM private.log_admin('account_' || _status, 'user', _user::text, jsonb_build_object('reason', _reason));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_role(_user uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
  IF _user = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own role'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user, _role);
  PERFORM private.log_admin('role_changed', 'user', _user::text, jsonb_build_object('role', _role));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_prime(_user uuid, _active boolean, _months int DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
  IF _active THEN
    INSERT INTO public.prime_memberships (user_id, status, plan, current_period_end, cancel_at_period_end)
    VALUES (_user, 'active', 'manual', now() + make_interval(months => GREATEST(_months,1)), true)
    ON CONFLICT (user_id) DO UPDATE SET status = 'active', plan = 'manual',
      current_period_end = now() + make_interval(months => GREATEST(_months,1)), cancel_at_period_end = true;
  ELSE
    UPDATE public.prime_memberships SET status = 'canceled', current_period_end = now() WHERE user_id = _user;
  END IF;
  PERFORM private.log_admin(CASE WHEN _active THEN 'prime_granted' ELSE 'prime_revoked' END, 'user', _user::text, jsonb_build_object('months', _months));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_broadcast(_title text, _message text, _role text DEFAULT NULL, _country text DEFAULT NULL)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _n int;
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
  IF coalesce(trim(_title),'') = '' OR coalesce(trim(_message),'') = '' THEN RAISE EXCEPTION 'Title and message are required'; END IF;
  INSERT INTO public.notifications (user_id, type, title, message, link, sound)
  SELECT p.id, 'announcement', _title, _message, '/home', true
  FROM public.profiles p
  WHERE p.deleted_at IS NULL AND p.account_status = 'active'
    AND (_country IS NULL OR p.country = _country)
    AND (_role IS NULL OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role::text = _role));
  GET DIAGNOSTICS _n = ROW_COUNT;
  INSERT INTO public.announcements (title, message, target_role, target_country, recipients, sent_by)
  VALUES (_title, _message, _role, _country, _n, auth.uid());
  PERFORM private.log_admin('announcement_sent', 'announcement', NULL, jsonb_build_object('title', _title, 'role', _role, 'country', _country, 'recipients', _n));
  RETURN _n;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_remove_review(_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  DELETE FROM public.reviews WHERE id = _id;
  PERFORM private.log_admin('review_removed', 'review', _id::text, jsonb_build_object('reason', _reason));
END; $$;

DO $$ DECLARE f text; BEGIN
  FOREACH f IN ARRAY ARRAY[
    'admin_cancel_order(uuid,text)','admin_refund_order(uuid,numeric,text)','admin_reassign_driver(uuid,uuid)',
    'admin_force_status(uuid,text,text)','admin_add_note(uuid,text)','admin_flag_order(uuid,text)',
    'admin_resolve_dispute(uuid,text)','admin_set_account_status(uuid,text,text)','admin_set_role(uuid,app_role)',
    'admin_set_prime(uuid,boolean,int)','admin_broadcast(text,text,text,text)','admin_remove_review(uuid,text)']
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
END $$;
