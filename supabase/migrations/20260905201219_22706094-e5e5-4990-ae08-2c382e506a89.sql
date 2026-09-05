-- RESTAURANTS
CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  country text,
  city text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurants_owner ON public.restaurants(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own restaurants" ON public.restaurants
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Signed-in users view approved restaurants" ON public.restaurants
  FOR SELECT TO authenticated USING (status = 'approved');
CREATE POLICY "Vendors create own restaurants" ON public.restaurants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND public.has_role(auth.uid(), 'vendor'));
CREATE POLICY "Owners update own restaurants" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete own restaurants" ON public.restaurants
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- keep vendor-controlled status server-side
CREATE OR REPLACE FUNCTION public.prevent_restaurant_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.status := OLD.status;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.prevent_restaurant_status_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER restaurants_lock_status BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.prevent_restaurant_status_change();

-- MENU ITEMS
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  image_url text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own menu items" ON public.menu_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "Signed-in users view available items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (available AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.status = 'approved'));

-- DRIVERS
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type text,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('offline','available','busy')),
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers manage own record" ON public.drivers
  FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND public.has_role(auth.uid(), 'driver'));

-- DRIVER LOCATIONS
CREATE TABLE public.driver_locations (
  driver_id uuid PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_locations TO authenticated;
GRANT ALL ON public.driver_locations TO service_role;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers manage own location" ON public.driver_locations
  FOR ALL TO authenticated
  USING (auth.uid() = driver_id) WITH CHECK (auth.uid() = driver_id);

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','preparing','ready','picked_up','delivered','cancelled')),
  country text,
  currency text NOT NULL DEFAULT 'EUR',
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_driver ON public.orders(driver_id);
CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Customers create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Drivers view assigned orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = driver_id);
CREATE POLICY "Drivers update assigned orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = driver_id) WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Vendors view own restaurant orders" ON public.orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));
CREATE POLICY "Vendors update own restaurant orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()));

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own order items" ON public.order_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "Drivers view assigned order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.driver_id = auth.uid()));
CREATE POLICY "Vendors view own restaurant order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.restaurants r ON r.id = o.restaurant_id
    WHERE o.id = order_id AND r.owner_id = auth.uid()
  ));