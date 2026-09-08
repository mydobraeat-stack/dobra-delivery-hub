CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  link text,
  sound boolean NOT NULL DEFAULT false,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id, read, created_at DESC);

-- helper: insert one notification
CREATE OR REPLACE FUNCTION private.notify_user(
  _user uuid, _type text, _title text, _message text,
  _order uuid DEFAULT NULL, _link text DEFAULT NULL, _sound boolean DEFAULT false
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, message, related_order_id, link, sound)
  SELECT _user, _type, _title, _message, _order, _link, _sound WHERE _user IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION private.notify_admins(
  _type text, _title text, _message text, _link text DEFAULT NULL, _sound boolean DEFAULT true
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, message, link, sound)
  SELECT ur.user_id, _type, _title, _message, _link, _sound
  FROM public.user_roles ur WHERE ur.role = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.notify_order_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _owner uuid;
  _rname text;
  _ref text := '#' || upper(right(NEW.id::text, 5));
BEGIN
  SELECT r.owner_id, r.name INTO _owner, _rname FROM public.restaurants r WHERE r.id = NEW.restaurant_id;

  IF TG_OP = 'INSERT' THEN
    PERFORM private.notify_user(_owner, 'order_new', 'New order ' || _ref,
      'A new order just came in. Accept it to start preparing.', NEW.id, '/vendor', true);
    RETURN NEW;
  END IF;

  IF NEW.driver_id IS DISTINCT FROM OLD.driver_id AND NEW.driver_id IS NOT NULL THEN
    PERFORM private.notify_user(NEW.customer_id, 'driver_assigned', 'Driver on the way',
      'A driver picked up your order ' || _ref || '.', NEW.id, '/orders/' || NEW.id, false);
    PERFORM private.notify_user(_owner, 'driver_assigned', 'Driver assigned',
      'A driver accepted delivery for order ' || _ref || '.', NEW.id, '/vendor', false);
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'accepted' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_accepted', 'Order accepted',
        COALESCE(_rname, 'The restaurant') || ' accepted your order ' || _ref || '.', NEW.id, '/orders/' || NEW.id, false);
    ELSIF NEW.status = 'preparing' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_preparing', 'Being prepared',
        'Your order ' || _ref || ' is being prepared.', NEW.id, '/orders/' || NEW.id, false);
    ELSIF NEW.status = 'ready' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_ready', 'Ready for pickup',
        'Your order ' || _ref || ' is ready and waiting for a driver.', NEW.id, '/orders/' || NEW.id, false);
      IF NEW.driver_id IS NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_order_id, link, sound)
        SELECT ur.user_id, 'delivery_available', 'New delivery available',
          'Order ' || _ref || ' is ready for pickup.', NEW.id, '/driver', true
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.role = 'driver' AND p.approval_status = 'approved';
      ELSE
        PERFORM private.notify_user(NEW.driver_id, 'delivery_available', 'Order ready',
          'Order ' || _ref || ' is ready for pickup.', NEW.id, '/driver/delivery/' || NEW.id, true);
      END IF;
    ELSIF NEW.status = 'picked_up' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_picked_up', 'Your order is on the way',
        'Order ' || _ref || ' has left the restaurant.', NEW.id, '/orders/' || NEW.id, false);
    ELSIF NEW.status = 'delivered' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_delivered', 'Order delivered',
        'Enjoy! Order ' || _ref || ' has been delivered.', NEW.id, '/orders/' || NEW.id, true);
      PERFORM private.notify_user(_owner, 'order_delivered', 'Order delivered',
        'Order ' || _ref || ' was delivered.', NEW.id, '/vendor', false);
    ELSIF NEW.status = 'cancelled' THEN
      PERFORM private.notify_user(NEW.customer_id, 'order_cancelled', 'Order cancelled',
        'Order ' || _ref || ' was cancelled.', NEW.id, '/orders/' || NEW.id, false);
      PERFORM private.notify_user(_owner, 'order_cancelled', 'Order cancelled',
        'Order ' || _ref || ' was cancelled.', NEW.id, '/vendor', false);
      PERFORM private.notify_user(NEW.driver_id, 'order_cancelled', 'Delivery cancelled',
        'Order ' || _ref || ' was cancelled.', NEW.id, '/driver', false);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER orders_notify_insert AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_events();
CREATE TRIGGER orders_notify_update AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_events();

CREATE OR REPLACE FUNCTION public.notify_profile_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role app_role;
BEGIN
  SELECT ur.role INTO _role FROM public.user_roles ur WHERE ur.user_id = NEW.id LIMIT 1;

  IF TG_OP = 'INSERT' THEN
    IF NEW.approval_status = 'pending' AND _role IN ('vendor','driver') THEN
      PERFORM private.notify_admins('signup_pending', 'New ' || _role || ' signup',
        COALESCE(NEW.full_name, NEW.email, 'A new user') || ' is waiting for approval.', '/admin/approvals', true);
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    IF NEW.approval_status = 'approved' THEN
      PERFORM private.notify_user(NEW.id, 'account_approved', 'Account approved',
        'Your account has been approved. You can start using Dobra.', NULL, '/home', true);
    ELSIF NEW.approval_status = 'rejected' THEN
      PERFORM private.notify_user(NEW.id, 'account_rejected', 'Account not approved',
        'Your account was not approved. Contact support for details.', NULL, '/home', false);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER profiles_notify_insert AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_profile_approval();
CREATE TRIGGER profiles_notify_update AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_profile_approval();

CREATE OR REPLACE FUNCTION public.notify_restaurant_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM private.notify_admins('restaurant_pending', 'New restaurant awaiting review',
      NEW.name || ' was submitted for approval.', '/admin/restaurants', true);
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM private.notify_user(NEW.owner_id, 'restaurant_status', 'Restaurant ' || NEW.status,
      NEW.name || ' is now ' || NEW.status || '.', NULL, '/vendor/store', true);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER restaurants_notify_insert AFTER INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.notify_restaurant_status();
CREATE TRIGGER restaurants_notify_update AFTER UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.notify_restaurant_status();

CREATE OR REPLACE FUNCTION public.notify_driver_documents()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM private.notify_admins('document_pending', 'Driver document uploaded',
      'A driver uploaded a ' || NEW.doc_type || ' for review.', '/admin/drivers', true);
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM private.notify_user(NEW.driver_id, 'document_status', 'Document ' || NEW.status,
      'Your ' || NEW.doc_type || ' was ' || NEW.status || '.', NULL, '/driver/documents', false);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER driver_documents_notify_insert AFTER INSERT ON public.driver_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_driver_documents();
CREATE TRIGGER driver_documents_notify_update AFTER UPDATE ON public.driver_documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_driver_documents();

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;