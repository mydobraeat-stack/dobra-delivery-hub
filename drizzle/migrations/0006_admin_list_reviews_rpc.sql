-- Staff-only review listing that includes the reviewer identity (customer_id).
-- The column-level GRANT on public.reviews deliberately excludes customer_id from
-- general authenticated reads, so the admin reviews page must go through this
-- SECURITY DEFINER function which checks staff role first.
CREATE OR REPLACE FUNCTION public.admin_list_reviews()
RETURNS TABLE (
  id uuid,
  restaurant_id uuid,
  customer_id uuid,
  restaurant_rating integer,
  driver_rating integer,
  comment text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.id, r.restaurant_id, r.customer_id, r.restaurant_rating, r.driver_rating, r.comment, r.created_at
  FROM public.reviews r
  WHERE private.is_staff()
  ORDER BY r.created_at DESC
  LIMIT 300;
$$;

REVOKE ALL ON FUNCTION public.admin_list_reviews() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_reviews() TO authenticated;