DROP POLICY IF EXISTS "Signed-in users read reviews" ON public.reviews;

CREATE POLICY "Read reviews of live restaurants"
ON public.reviews FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.restaurants r
  WHERE r.id = reviews.restaurant_id AND r.status = 'approved'
));

CREATE POLICY "Participants and admins read reviews"
ON public.reviews FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR auth.uid() = driver_id
  OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = reviews.restaurant_id AND r.owner_id = auth.uid())
  OR private.is_platform_admin()
);

REVOKE SELECT ON public.reviews FROM authenticated;
GRANT SELECT (id, order_id, restaurant_id, driver_id, restaurant_rating, driver_rating, comment, created_at, updated_at) ON public.reviews TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role;
BEGIN
  BEGIN
    _role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')::public.app_role;
  EXCEPTION WHEN others THEN
    _role := 'customer';
  END;

  -- Never allow a self-assigned privileged role at signup.
  IF _role NOT IN ('customer', 'vendor', 'driver') THEN
    _role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, country, approval_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'country',
    CASE WHEN _role = 'customer' THEN 'approved' ELSE 'pending' END
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;