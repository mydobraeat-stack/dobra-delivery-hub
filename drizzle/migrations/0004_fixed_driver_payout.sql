ALTER TABLE public.country_pricing ADD COLUMN IF NOT EXISTS driver_payout_fixed numeric NOT NULL DEFAULT 0;
UPDATE public.country_pricing SET driver_payout_fixed = CASE WHEN country = 'Cameroon' THEN 1000 ELSE 10 END WHERE driver_payout_fixed = 0;
COMMENT ON COLUMN public.country_pricing.driver_payout_pct IS 'DEPRECATED: replaced by driver_payout_fixed';

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_payout numeric NOT NULL DEFAULT 0;
UPDATE public.orders o SET driver_payout = COALESCE(
  (SELECT p.driver_payout_fixed FROM public.country_pricing p WHERE lower(p.country) = lower(coalesce(o.country,'Poland'))),
  (SELECT p.driver_payout_fixed FROM public.country_pricing p WHERE p.country = 'Poland'), 0);

CREATE OR REPLACE FUNCTION private.order_set_driver_payout()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  -- Fixed per-delivery payout, locked in when the order is placed.
  NEW.driver_payout := COALESCE(
    (SELECT driver_payout_fixed FROM public.country_pricing WHERE lower(country) = lower(coalesce(NEW.country,'Poland'))),
    (SELECT driver_payout_fixed FROM public.country_pricing WHERE country = 'Poland'), 0);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS orders_set_driver_payout ON public.orders;
CREATE TRIGGER orders_set_driver_payout BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION private.order_set_driver_payout();

CREATE OR REPLACE FUNCTION private.order_keep_driver_payout()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  NEW.driver_payout := OLD.driver_payout;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS orders_keep_driver_payout ON public.orders;
CREATE TRIGGER orders_keep_driver_payout BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION private.order_keep_driver_payout();