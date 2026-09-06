CREATE POLICY "Admins view driver documents storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'driver-documents'
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
    )
  );