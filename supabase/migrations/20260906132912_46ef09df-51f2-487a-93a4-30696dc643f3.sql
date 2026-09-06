
DROP POLICY IF EXISTS "Drivers view unassigned ready orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers claim unassigned ready orders" ON public.orders;

CREATE POLICY "Drivers view unassigned ready orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    driver_id IS NULL AND status = 'ready'
    AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'driver')
  );

CREATE POLICY "Drivers claim unassigned ready orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    driver_id IS NULL AND status = 'ready'
    AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'driver')
  )
  WITH CHECK (driver_id = auth.uid());
