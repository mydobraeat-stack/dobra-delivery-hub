-- inline admin checks instead of an exposed helper function
CREATE OR REPLACE FUNCTION public.prevent_approval_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
  ) THEN
    NEW.approval_status := OLD.approval_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_restaurant_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
  ) THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP POLICY "Admins view all profiles" ON public.profiles;
DROP POLICY "Admins update all profiles" ON public.profiles;
DROP POLICY "Admins view all roles" ON public.user_roles;
DROP POLICY "Admins grant roles" ON public.user_roles;
DROP POLICY "Admins remove roles" ON public.user_roles;
DROP POLICY "Admins view all restaurants" ON public.restaurants;
DROP POLICY "Admins update all restaurants" ON public.restaurants;
DROP POLICY "Admins view all drivers" ON public.drivers;
DROP POLICY "Admins update all drivers" ON public.drivers;
DROP POLICY "Admins view all driver documents" ON public.driver_documents;
DROP POLICY "Admins review driver documents" ON public.driver_documents;
DROP POLICY "Admins view all orders" ON public.orders;
DROP POLICY "Admins view all order items" ON public.order_items;
DROP POLICY "Admins view all menu items" ON public.menu_items;

DROP FUNCTION IF EXISTS public.is_admin();

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins grant roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins remove roles" ON public.user_roles
  FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins view all restaurants" ON public.restaurants
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins update all restaurants" ON public.restaurants
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins view all drivers" ON public.drivers
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins update all drivers" ON public.drivers
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins view all driver documents" ON public.driver_documents
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins review driver documents" ON public.driver_documents
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));
CREATE POLICY "Admins view all menu items" ON public.menu_items
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));