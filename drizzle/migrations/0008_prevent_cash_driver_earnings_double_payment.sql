CREATE OR REPLACE FUNCTION public.admin_cash_payout_summary() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
 WITH earnings AS (
 SELECT driver_id, currency, sum(driver_payout) earned,
 sum(CASE WHEN payment_method='cash' THEN driver_payout ELSE 0 END) retained
 FROM public.orders WHERE status='delivered' AND driver_id IS NOT NULL GROUP BY driver_id,currency
 ), payments AS (SELECT driver_id,currency,sum(amount) paid FROM public.driver_cash_payouts GROUP BY driver_id,currency)
 SELECT jsonb_build_object('drivers', coalesce((SELECT jsonb_agg(jsonb_build_object('driver_id',e.driver_id,'name',coalesce(p.full_name,p.email,e.driver_id::text),'currency',e.currency,'earned',e.earned,'retained',e.retained,'paid',coalesce(x.paid,0),'owed',greatest(0,e.earned-e.retained-coalesce(x.paid,0)))) FROM earnings e JOIN public.profiles p ON p.id=e.driver_id LEFT JOIN payments x ON x.driver_id=e.driver_id AND x.currency=e.currency),'[]'::jsonb),
 'balances',coalesce((SELECT jsonb_agg(jsonb_build_object('currency',c.currency,'online',c.online,'cash',c.cash,'cashSettled',c.settled,'cashOutstanding',c.cash-c.gross_settled,'cashPaidOut',coalesce(y.paid,0),'cashAvailable',c.settled-coalesce(y.paid,0))) FROM (SELECT currency,
 coalesce(sum(total-refund_amount) FILTER (WHERE payment_method <> 'cash' AND payment_status IN ('paid','refunded','partially_refunded')),0) online,
 coalesce(sum(total-refund_amount) FILTER (WHERE payment_method='cash'),0) cash,
 coalesce(sum(total-refund_amount-driver_payout) FILTER (WHERE payment_method='cash' AND cash_settled_at IS NOT NULL),0) settled,
 coalesce(sum(total-refund_amount) FILTER (WHERE payment_method='cash' AND cash_settled_at IS NOT NULL),0) gross_settled
 FROM public.orders WHERE status='delivered' GROUP BY currency) c LEFT JOIN (SELECT currency,sum(amount) paid FROM public.driver_cash_payouts GROUP BY currency) y ON y.currency=c.currency),'[]'::jsonb)) INTO result;
 RETURN result;
END; $$;
CREATE OR REPLACE FUNCTION public.admin_record_driver_cash_payout(_driver uuid, _currency text, _amount numeric, _reference text, _request uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE available numeric; owed numeric; payout_id uuid; existing public.driver_cash_payouts%ROWTYPE;
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can do this'; END IF;
 IF _amount IS NULL OR _amount <= 0 OR _amount <> round(_amount,2) OR _amount::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Enter a positive amount with at most two decimals'; END IF;
 IF _reference IS NULL OR length(trim(_reference)) NOT BETWEEN 3 AND 200 OR _request IS NULL THEN RAISE EXCEPTION 'A handover receipt/reference is required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('driver_cash_payout:'||_currency,0));
 SELECT * INTO existing FROM public.driver_cash_payouts WHERE request_id=_request;
 IF FOUND THEN
 IF existing.driver_id=_driver AND existing.currency=_currency AND existing.amount=_amount AND existing.reference=trim(_reference) THEN RETURN existing.id; END IF;
 RAISE EXCEPTION 'This payment request was already used';
 END IF;
 SELECT coalesce(sum(driver_payout),0) INTO owed FROM public.orders WHERE driver_id=_driver AND currency=_currency AND status='delivered' AND payment_method <> 'cash';
 SELECT owed-coalesce(sum(amount),0) INTO owed FROM public.driver_cash_payouts WHERE driver_id=_driver AND currency=_currency;
 IF _amount > owed THEN RAISE EXCEPTION 'Amount exceeds unpaid driver earnings'; END IF;
 SELECT coalesce(sum(total-refund_amount-driver_payout),0) INTO available FROM public.orders WHERE currency=_currency AND status='delivered' AND payment_method='cash' AND cash_settled_at IS NOT NULL;
 SELECT available-coalesce(sum(amount),0) INTO available FROM public.driver_cash_payouts WHERE currency=_currency;
 IF _amount > available THEN RAISE EXCEPTION 'Not enough settled cash available; collect driver settlements first'; END IF;
 INSERT INTO public.driver_cash_payouts(driver_id,currency,amount,reference,request_id,paid_by) VALUES(_driver,_currency,_amount,trim(_reference),_request,auth.uid()) RETURNING id INTO payout_id;
 PERFORM private.log_admin('driver_cash_payout','driver',_driver::text,jsonb_build_object('payout_id',payout_id,'amount',_amount,'currency',_currency,'reference',trim(_reference)));
 RETURN payout_id;
END; $$;