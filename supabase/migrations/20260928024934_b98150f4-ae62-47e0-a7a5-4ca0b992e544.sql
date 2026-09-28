
ALTER TABLE public.orders DROP CONSTRAINT orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status = ANY (ARRAY['pending','paid','failed','cash','refunded','voided','partially_refunded']));
ALTER TABLE public.prime_memberships DROP CONSTRAINT prime_memberships_plan_check;
ALTER TABLE public.prime_memberships ADD CONSTRAINT prime_memberships_plan_check CHECK (plan = ANY (ARRAY['monthly','manual']));

CREATE OR REPLACE FUNCTION public.admin_set_prime(_user uuid, _active boolean, _months int DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
  IF _active THEN
    INSERT INTO public.prime_memberships (user_id, status, plan, current_period_end, cancel_at_period_end)
    VALUES (_user, 'active', 'manual', now() + make_interval(months => GREATEST(_months,1)), true)
    ON CONFLICT (user_id) DO UPDATE SET status = 'active', plan = 'manual',
      current_period_end = now() + make_interval(months => GREATEST(_months,1)), cancel_at_period_end = true;
  ELSE
    UPDATE public.prime_memberships SET status = 'cancelled', current_period_end = now() WHERE user_id = _user;
  END IF;
  PERFORM private.log_admin(CASE WHEN _active THEN 'prime_granted' ELSE 'prime_revoked' END, 'user', _user::text, jsonb_build_object('months', _months));
END; $$;
