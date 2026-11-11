DROP POLICY IF EXISTS "View images of approved restaurants" ON storage.objects;
CREATE POLICY "View images of approved restaurants" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = ANY (ARRAY['restaurant-logos','menu-images'])
  AND (
    (storage.foldername(objects.name))[1] = (SELECT auth.uid())::text
    OR private.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.owner_id::text = (storage.foldername(objects.name))[1]
        AND r.status = 'approved'
    )
  )
);