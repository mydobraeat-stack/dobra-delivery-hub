CREATE FUNCTION public.guard_account_mode_preference() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
IF current_user IN ('authenticated','anon') AND NEW.preferred_mode IS DISTINCT FROM OLD.preferred_mode THEN RAISE EXCEPTION 'mode_requires_safe_switch'; END IF;
RETURN NEW; END; $$;
CREATE TRIGGER guard_account_mode_preference BEFORE UPDATE OF preferred_mode ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.guard_account_mode_preference();
CREATE POLICY "Driver records cannot be self deleted" ON public.drivers AS RESTRICTIVE FOR DELETE TO authenticated USING (private.is_platform_admin());

CREATE OR REPLACE FUNCTION public.guard_driver_work() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
IF NEW.driver_id IS NOT NULL AND (TG_OP='INSERT' OR NEW.driver_id IS DISTINCT FROM OLD.driver_id OR NEW.status IS DISTINCT FROM OLD.status) THEN
PERFORM 1 FROM public.drivers WHERE id=NEW.driver_id FOR UPDATE;
IF NOT private.is_staff() AND auth.uid() IS NOT NULL THEN
IF NOT public.is_approved_driver(NEW.driver_id) THEN RAISE EXCEPTION 'driver_not_approved'; END IF;
IF EXISTS(SELECT 1 FROM public.drivers d JOIN public.profiles p ON p.id=d.id WHERE d.id=NEW.driver_id AND d.existing_customer AND COALESCE(p.preferred_mode,'customer')<>'driver') THEN RAISE EXCEPTION 'driver_mode_required'; END IF;
END IF;
END IF;
RETURN NEW;
END; $$;
ALTER POLICY "Driver reads require approval" ON public.orders USING (customer_id=auth.uid() OR private.is_staff() OR EXISTS(SELECT 1 FROM public.restaurants WHERE id=restaurant_id AND owner_id=auth.uid()) OR public.is_approved_driver(auth.uid()));

CREATE FUNCTION public.guard_driver_mode_online() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.status IN ('available','busy') AND auth.uid()=NEW.id AND NEW.existing_customer AND EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.id AND COALESCE(preferred_mode,'customer')<>'driver') THEN RAISE EXCEPTION 'driver_mode_required'; END IF;
RETURN NEW; END; $$;
CREATE TRIGGER guard_driver_mode_online BEFORE INSERT OR UPDATE OF status ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.guard_driver_mode_online();

CREATE FUNCTION public.guard_existing_driver_approval() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _required text[];
BEGIN
IF NEW.existing_customer AND NEW.docs_status='approved' AND OLD.docs_status IS DISTINCT FROM NEW.docs_status THEN
IF OLD.docs_status<>'in_review' OR NEW.terms_accepted_at IS NULL THEN RAISE EXCEPTION 'application_not_submitted'; END IF;
_required:=ARRAY['profile_photo','id_card','insulated_bag'];
IF NEW.vehicle_type IS NULL THEN RAISE EXCEPTION 'vehicle_required'; END IF;
IF NEW.vehicle_type<>'On foot' THEN _required:=_required||ARRAY['vehicle_photo']; END IF;
IF NEW.vehicle_type IN ('Car','Motorbike') THEN _required:=_required||ARRAY['drivers_licence','insurance','vehicle_registration']; END IF;
IF EXISTS(SELECT 1 FROM unnest(_required) x WHERE NOT EXISTS(SELECT 1 FROM public.driver_documents WHERE driver_id=NEW.id AND doc_type=x AND status<>'rejected' AND file_path LIKE NEW.id::text||'/%')) THEN RAISE EXCEPTION 'documents_required'; END IF;
END IF;
RETURN NEW; END; $$;
CREATE TRIGGER guard_existing_driver_approval BEFORE UPDATE OF docs_status ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.guard_existing_driver_approval();

CREATE FUNCTION public.invalidate_changed_driver_document() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _id uuid;
BEGIN
_id:=CASE WHEN TG_OP='DELETE' THEN OLD.driver_id ELSE NEW.driver_id END;
IF private.is_platform_admin() THEN RETURN COALESCE(NEW,OLD); END IF;
PERFORM 1 FROM public.drivers WHERE id=_id FOR UPDATE;
IF EXISTS(SELECT 1 FROM public.orders WHERE driver_id=_id AND status NOT IN ('delivered','cancelled')) THEN RAISE EXCEPTION 'active_delivery'; END IF;
IF TG_OP='DELETE' OR (TG_OP='UPDATE' AND (NEW.file_path IS DISTINCT FROM OLD.file_path OR NEW.status IS DISTINCT FROM OLD.status OR NEW.expires_on IS DISTINCT FROM OLD.expires_on)) THEN
UPDATE public.drivers SET docs_status='draft',status='offline' WHERE id=_id AND docs_status IN ('approved','in_review');
END IF;
RETURN COALESCE(NEW,OLD); END; $$;
CREATE TRIGGER invalidate_changed_driver_document AFTER UPDATE OR DELETE ON public.driver_documents FOR EACH ROW EXECUTE FUNCTION public.invalidate_changed_driver_document();

CREATE FUNCTION public.prevent_unapproved_driver_offer_notifications() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.type='delivery_available' AND NOT public.is_approved_driver(NEW.user_id) THEN RETURN NULL; END IF;
RETURN NEW; END; $$;
CREATE TRIGGER prevent_unapproved_driver_offer_notifications BEFORE INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.prevent_unapproved_driver_offer_notifications();