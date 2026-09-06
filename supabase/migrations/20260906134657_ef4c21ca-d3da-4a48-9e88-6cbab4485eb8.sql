-- Restaurant extras
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS is_open boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS min_order numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- Menu extras
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Mains';

-- Order extras
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS subtotal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eta_minutes integer NOT NULL DEFAULT 30;

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  restaurant_rating integer NOT NULL CHECK (restaurant_rating BETWEEN 1 AND 5),
  driver_rating integer CHECK (driver_rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users read reviews"
  ON public.reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers write reviews for own delivered orders"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = reviews.order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'delivered'
    )
  );

CREATE POLICY "Customers edit own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE INDEX IF NOT EXISTS reviews_restaurant_idx ON public.reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS reviews_driver_idx ON public.reviews(driver_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Keep restaurant rating in sync with its reviews
CREATE OR REPLACE FUNCTION public.refresh_restaurant_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _restaurant uuid := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
BEGIN
  UPDATE public.restaurants r
  SET rating = COALESCE((
    SELECT ROUND(AVG(rv.restaurant_rating)::numeric, 1)
    FROM public.reviews rv WHERE rv.restaurant_id = _restaurant
  ), 4.5)
  WHERE r.id = _restaurant;
  RETURN NULL;
END;
$$;

CREATE TRIGGER reviews_refresh_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_restaurant_rating();

-- Customers can follow their driver while the order is on the way
CREATE POLICY "Customers view driver location for active orders"
  ON public.driver_locations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.driver_id = driver_locations.driver_id
      AND o.customer_id = auth.uid()
      AND o.status IN ('ready', 'picked_up')
  ));