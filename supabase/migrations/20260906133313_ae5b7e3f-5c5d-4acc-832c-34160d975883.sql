
DROP POLICY IF EXISTS "Vendors create own restaurants" ON public.restaurants;
CREATE POLICY "Vendors create own restaurants"
  ON public.restaurants FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'vendor')
  );

DROP POLICY IF EXISTS "Drivers manage own record" ON public.drivers;
CREATE POLICY "Drivers manage own record"
  ON public.drivers FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'driver')
  );
