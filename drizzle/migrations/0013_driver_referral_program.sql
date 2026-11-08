CREATE TABLE public.driver_referral_settings (
 country text PRIMARY KEY REFERENCES public.country_pricing(country),
 bonus numeric CHECK (bonus > 0 AND bonus = round(bonus,2)),
 enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (NOT enabled OR bonus IS NOT NULL)
);
GRANT SELECT ON public.driver_referral_settings TO authenticated;
GRANT ALL ON public.driver_referral_settings TO service_role;
ALTER TABLE public.driver_referral_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers and admins read referral settings" ON public.driver_referral_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'driver') OR private.is_platform_admin());
CREATE TABLE public.driver_referral_codes (
 driver_id uuid PRIMARY KEY REFERENCES public.drivers(id),
 code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.driver_referral_codes TO authenticated;
GRANT ALL ON public.driver_referral_codes TO service_role;
ALTER TABLE public.driver_referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own referral code" ON public.driver_referral_codes FOR SELECT TO authenticated USING (driver_id=auth.uid() OR private.is_platform_admin());
CREATE TABLE public.driver_referrals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 referrer_id uuid NOT NULL REFERENCES public.drivers(id),
 referred_id uuid NOT NULL UNIQUE REFERENCES public.drivers(id),
 country text NOT NULL REFERENCES public.country_pricing(country),
 currency text NOT NULL,
 bonus numeric NOT NULL CHECK (bonus > 0 AND bonus = round(bonus,2)),
 created_at timestamptz NOT NULL DEFAULT now(),
 qualifying_order_id uuid UNIQUE REFERENCES public.orders(id),
 qualified_at timestamptz,
 paid_at timestamptz,
 paid_by uuid,
 payment_reference text,
 CHECK(referrer_id<>referred_id)
);
GRANT SELECT ON public.driver_referrals TO authenticated;
GRANT ALL ON public.driver_referrals TO service_role;
ALTER TABLE public.driver_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants and super admins read referrals" ON public.driver_referrals FOR SELECT TO authenticated USING (auth.uid() IN (referrer_id,referred_id) OR private.is_platform_admin());
CREATE OR REPLACE FUNCTION public.my_driver_referrals() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.drivers%ROWTYPE; c text; result jsonb;
BEGIN
 SELECT * INTO d FROM public.drivers WHERE id=auth.uid();
 IF NOT FOUND OR NOT public.has_role(auth.uid(),'driver') THEN RAISE EXCEPTION 'referral_driver_only'; END IF;
 IF public.is_approved_driver(auth.uid()) THEN
 INSERT INTO public.driver_referral_codes(driver_id) VALUES(auth.uid()) ON CONFLICT(driver_id) DO NOTHING;
 SELECT code INTO c FROM public.driver_referral_codes WHERE driver_id=auth.uid();
 END IF;
 SELECT jsonb_build_object('code',c,'country',d.country,'settings',(SELECT jsonb_build_object('enabled',s.enabled,'bonus',s.bonus,'currency',p.currency) FROM public.driver_referral_settings s JOIN public.country_pricing p USING(country) WHERE s.country=d.country),'referrals',coalesce((SELECT jsonb_agg(jsonb_build_object('id',r.id,'bonus',r.bonus,'currency',r.currency,'created_at',r.created_at,'qualified_at',r.qualified_at,'paid_at',r.paid_at)) FROM public.driver_referrals r WHERE r.referrer_id=auth.uid()),'[]'::jsonb),'applied',EXISTS(SELECT 1 FROM public.driver_referrals WHERE referred_id=auth.uid()),'canApply',NOT EXISTS(SELECT 1 FROM public.orders WHERE driver_id=auth.uid() AND status='delivered')) INTO result;
 RETURN result;
END; $$;
CREATE OR REPLACE FUNCTION public.apply_driver_referral(_code text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.drivers%ROWTYPE; referrer uuid; rate numeric; cur text;
BEGIN
 SELECT * INTO d FROM public.drivers WHERE id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR NOT public.has_role(auth.uid(),'driver') THEN RAISE EXCEPTION 'referral_driver_only'; END IF;
 IF EXISTS(SELECT 1 FROM public.driver_referrals WHERE referred_id=auth.uid()) THEN RAISE EXCEPTION 'referral_already_applied'; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE driver_id=auth.uid() AND status='delivered') THEN RAISE EXCEPTION 'referral_too_late'; END IF;
 SELECT driver_id INTO referrer FROM public.driver_referral_codes WHERE code=upper(trim(_code));
 IF referrer IS NULL OR referrer=auth.uid() OR NOT public.is_approved_driver(referrer) THEN RAISE EXCEPTION 'referral_invalid_code'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.drivers WHERE id=referrer AND country=d.country) THEN RAISE EXCEPTION 'referral_wrong_country'; END IF;
 IF EXISTS(SELECT 1 FROM public.driver_referrals WHERE referrer_id=auth.uid()) THEN RAISE EXCEPTION 'referral_too_late'; END IF;
 SELECT s.bonus,p.currency INTO rate,cur FROM public.driver_referral_settings s JOIN public.country_pricing p USING(country) WHERE s.country=d.country AND s.enabled FOR SHARE OF s;
 IF rate IS NULL THEN RAISE EXCEPTION 'referral_not_active'; END IF;
 INSERT INTO public.driver_referrals(referrer_id,referred_id,country,currency,bonus) VALUES(referrer,auth.uid(),d.country,cur,rate);
END; $$;
CREATE OR REPLACE FUNCTION public.qualify_driver_referral() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status='delivered' AND OLD.status IS DISTINCT FROM 'delivered' AND NEW.driver_id IS NOT NULL AND public.is_approved_driver(NEW.driver_id) AND (NEW.payment_method='cash' OR NEW.payment_status='paid') THEN
 UPDATE public.driver_referrals SET qualifying_order_id=NEW.id,qualified_at=now() WHERE referred_id=NEW.driver_id AND qualified_at IS NULL AND created_at<=now();
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER qualify_driver_referral AFTER UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.qualify_driver_referral();
CREATE OR REPLACE FUNCTION public.admin_driver_referrals() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'referral_admin_only'; END IF;
 RETURN jsonb_build_object('settings',coalesce((SELECT jsonb_agg(jsonb_build_object('country',p.country,'currency',p.currency,'bonus',s.bonus,'enabled',coalesce(s.enabled,false))) FROM public.country_pricing p LEFT JOIN public.driver_referral_settings s USING(country)),'[]'::jsonb),'referrals',coalesce((SELECT jsonb_agg(jsonb_build_object('id',r.id,'referrer',coalesce(a.full_name,'—'),'referred',coalesce(b.full_name,'—'),'country',r.country,'currency',r.currency,'bonus',r.bonus,'created_at',r.created_at,'qualified_at',r.qualified_at,'paid_at',r.paid_at,'payment_reference',r.payment_reference) ORDER BY r.created_at DESC) FROM public.driver_referrals r JOIN public.profiles a ON a.id=r.referrer_id JOIN public.profiles b ON b.id=r.referred_id),'[]'::jsonb));
END; $$;
CREATE OR REPLACE FUNCTION public.admin_set_driver_referral(_country text,_bonus numeric,_enabled boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'referral_admin_only'; END IF;
 IF _bonus IS NOT NULL AND (_bonus::text IN ('NaN','Infinity','-Infinity') OR _bonus<=0 OR _bonus<>round(_bonus,2)) OR _enabled AND _bonus IS NULL OR _enabled IS NULL THEN RAISE EXCEPTION 'referral_invalid_bonus'; END IF;
 INSERT INTO public.driver_referral_settings(country,bonus,enabled) VALUES(_country,_bonus,_enabled) ON CONFLICT(country) DO UPDATE SET bonus=excluded.bonus,enabled=excluded.enabled,updated_at=now();
 PERFORM private.log_admin('driver_referral_settings','country',_country,jsonb_build_object('bonus',_bonus,'enabled',_enabled));
END; $$;
CREATE OR REPLACE FUNCTION public.admin_pay_driver_referral(_id uuid,_reference text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.driver_referrals%ROWTYPE;
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'referral_admin_only'; END IF;
 SELECT * INTO r FROM public.driver_referrals WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR r.qualified_at IS NULL THEN RAISE EXCEPTION 'referral_not_qualified'; END IF;
 IF r.paid_at IS NOT NULL THEN RETURN; END IF;
 IF _reference IS NULL OR length(trim(_reference)) NOT BETWEEN 3 AND 200 THEN RAISE EXCEPTION 'referral_reference_required'; END IF;
 UPDATE public.driver_referrals SET paid_at=now(),paid_by=auth.uid(),payment_reference=trim(_reference) WHERE id=_id;
 PERFORM private.log_admin('driver_referral_paid','driver_referral',_id::text,jsonb_build_object('bonus',r.bonus,'currency',r.currency,'reference',trim(_reference)));
END; $$;
REVOKE ALL ON FUNCTION public.my_driver_referrals(),public.apply_driver_referral(text),public.admin_driver_referrals(),public.admin_set_driver_referral(text,numeric,boolean),public.admin_pay_driver_referral(uuid,text),public.qualify_driver_referral() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.my_driver_referrals(),public.apply_driver_referral(text),public.admin_driver_referrals(),public.admin_set_driver_referral(text,numeric,boolean),public.admin_pay_driver_referral(uuid,text) TO authenticated;