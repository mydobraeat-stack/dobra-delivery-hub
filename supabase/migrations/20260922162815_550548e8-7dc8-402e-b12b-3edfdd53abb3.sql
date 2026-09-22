ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'food',
  ADD COLUMN IF NOT EXISTS pickup_address text,
  ADD COLUMN IF NOT EXISTS pickup_lat double precision,
  ADD COLUMN IF NOT EXISTS pickup_lng double precision,
  ADD COLUMN IF NOT EXISTS package_note text;

ALTER TABLE public.orders ALTER COLUMN restaurant_id DROP NOT NULL;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_kind_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_kind_check CHECK (kind IN ('food','package'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_food_needs_restaurant;
ALTER TABLE public.orders ADD CONSTRAINT orders_food_needs_restaurant
  CHECK (kind <> 'food' OR restaurant_id IS NOT NULL);

CREATE OR REPLACE FUNCTION public.notify_order_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _owner uuid;
  _rname text;
  _ref text := '#' || upper(right(NEW.id::text, 5));
BEGIN
  SELECT r.owner_id, r.name INTO _owner, _rname FROM public.restaurants r WHERE r.id = NEW.restaurant_id;

  IF TG_OP = 'INSERT' THEN
    IF NEW.kind = 'package' THEN
      IF NEW.driver_id IS NULL AND NEW.status = 'ready' THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_order_id, link, sound)
        SELECT ur.user_id, 'delivery_available', 'New package delivery',
          'Package request ' || _ref || ' is waiting for pickup.', NEW.id, '/driver', true
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.role = 'driver' AND p.approval_status = 'approved';
      END IF;
      RETURN NEW;
    END IF;
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
END; $function$;