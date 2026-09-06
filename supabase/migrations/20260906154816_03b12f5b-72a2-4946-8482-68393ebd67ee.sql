CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_platform_admin()
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
REVOKE ALL ON FUNCTION private.is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_platform_admin() TO authenticated;

ALTER POLICY "Admins view all profiles" ON public.profiles USING (private.is_platform_admin());
ALTER POLICY "Admins update all profiles" ON public.profiles USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
ALTER POLICY "Admins view all roles" ON public.user_roles USING (private.is_platform_admin());
ALTER POLICY "Admins grant roles" ON public.user_roles WITH CHECK (private.is_platform_admin());
ALTER POLICY "Admins remove roles" ON public.user_roles USING (private.is_platform_admin());
ALTER POLICY "Admins view all restaurants" ON public.restaurants USING (private.is_platform_admin());
ALTER POLICY "Admins update all restaurants" ON public.restaurants USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
ALTER POLICY "Admins view all drivers" ON public.drivers USING (private.is_platform_admin());
ALTER POLICY "Admins update all drivers" ON public.drivers USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
ALTER POLICY "Admins view all driver documents" ON public.driver_documents USING (private.is_platform_admin());
ALTER POLICY "Admins review driver documents" ON public.driver_documents USING (private.is_platform_admin()) WITH CHECK (private.is_platform_admin());
ALTER POLICY "Admins view all orders" ON public.orders USING (private.is_platform_admin());
ALTER POLICY "Admins view all order items" ON public.order_items USING (private.is_platform_admin());
ALTER POLICY "Admins view all menu items" ON public.menu_items USING (private.is_platform_admin());
ALTER POLICY "Admins view driver documents storage" ON storage.objects USING (bucket_id = 'driver-documents' AND private.is_platform_admin());

CREATE OR REPLACE FUNCTION public.prevent_approval_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN
    NEW.approval_status := OLD.approval_status;
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.prevent_restaurant_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END; $$;

DROP FUNCTION IF EXISTS public.is_platform_admin();