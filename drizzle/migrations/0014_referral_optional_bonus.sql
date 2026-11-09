CREATE OR REPLACE FUNCTION public.admin_set_driver_referral(_country text,_bonus numeric DEFAULT NULL,_enabled boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'referral_admin_only'; END IF;
 IF _bonus IS NOT NULL AND (_bonus::text IN ('NaN','Infinity','-Infinity') OR _bonus<=0 OR _bonus<>round(_bonus,2)) OR _enabled AND _bonus IS NULL OR _enabled IS NULL THEN RAISE EXCEPTION 'referral_invalid_bonus'; END IF;
 INSERT INTO public.driver_referral_settings(country,bonus,enabled) VALUES(_country,_bonus,_enabled) ON CONFLICT(country) DO UPDATE SET bonus=excluded.bonus,enabled=excluded.enabled,updated_at=now();
 PERFORM private.log_admin('driver_referral_settings','country',_country,jsonb_build_object('bonus',_bonus,'enabled',_enabled));
END; $$;