DROP POLICY IF EXISTS "Anyone reads pricing" ON public.country_pricing;
CREATE POLICY "Anyone reads enabled market pricing" ON public.country_pricing
  FOR SELECT TO anon, authenticated USING (enabled = true);

DROP POLICY IF EXISTS "Anyone reads platform settings" ON public.platform_settings;
CREATE POLICY "Staff read platform settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (private.is_staff());

DROP POLICY IF EXISTS "Signed-in users view shared images" ON storage.objects;
CREATE POLICY "Users view own profile photos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'profile-photos'
    AND ((storage.foldername(name))[1] = (select auth.uid())::text OR private.is_staff())
  );
CREATE POLICY "View images of approved restaurants" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id IN ('restaurant-logos','menu-images')
    AND (
      (storage.foldername(name))[1] = (select auth.uid())::text
      OR private.is_staff()
      OR EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.owner_id::text = (storage.foldername(name))[1]
          AND r.status = 'approved'
      )
    )
  );