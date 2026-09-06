CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

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
DROP POLICY IF EXISTS "Admins view driver documents storage" ON storage.objects;

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins grant roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins remove roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins view all restaurants" ON public.restaurants
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins update all restaurants" ON public.restaurants
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins view all drivers" ON public.drivers
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins update all drivers" ON public.drivers
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins view all driver documents" ON public.driver_documents
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins review driver documents" ON public.driver_documents
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins view all menu items" ON public.menu_items
  FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY "Admins view driver documents storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'driver-documents' AND public.is_platform_admin());

CREATE OR REPLACE FUNCTION public.prevent_approval_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
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
  IF NOT public.is_platform_admin() THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;