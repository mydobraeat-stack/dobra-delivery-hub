-- Shared viewing for the three non-sensitive buckets
CREATE POLICY "Signed-in users view shared images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('restaurant-logos','menu-images','profile-photos'));

-- Driver documents: owner-only read
CREATE POLICY "Drivers view own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owner-only writes across all four buckets (files live under <user-id>/...)
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('restaurant-logos','menu-images','profile-photos','driver-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('restaurant-logos','menu-images','profile-photos','driver-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id IN ('restaurant-logos','menu-images','profile-photos','driver-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('restaurant-logos','menu-images','profile-photos','driver-documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );