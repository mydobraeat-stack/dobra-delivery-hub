ALTER TABLE public.orders
  ADD COLUMN cash_settled_at timestamptz,
  ADD COLUMN cash_settled_by uuid;

COMMENT ON COLUMN public.orders.cash_settled_at IS 'When the driver handed over the cash collected for this order.';
COMMENT ON COLUMN public.orders.cash_settled_by IS 'Driver who marked the cash as settled.';

CREATE OR REPLACE FUNCTION public.driver_settle_cash(_order uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o public.orders%ROWTYPE;
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF o.driver_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Only the assigned driver can settle this order';
  END IF;
  IF o.status <> 'delivered' THEN
    RAISE EXCEPTION 'Only delivered orders can be settled';
  END IF;
  IF o.payment_method <> 'cash' THEN
    RAISE EXCEPTION 'Only cash orders can be settled';
  END IF;
  IF o.cash_settled_at IS NOT NULL THEN
    RAISE EXCEPTION 'Order already settled';
  END IF;
  UPDATE public.orders
    SET cash_settled_at = now(), cash_settled_by = auth.uid()
    WHERE id = _order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.driver_settle_cash(uuid) TO authenticated;