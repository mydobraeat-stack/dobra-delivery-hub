ALTER TABLE public.profiles ADD COLUMN preferred_mode text;
ALTER TABLE public.drivers ADD COLUMN existing_customer boolean NOT NULL DEFAULT false;
ALTER TABLE public.drivers ADD COLUMN terms_accepted_at timestamptz;

CREATE FUNCTION public.is_approved_driver(_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT EXISTS(SELECT 1 FROM public.drivers d JOIN public.profiles p ON p.id=d.id JOIN public.user_roles r ON r.user_id=d.id AND r.role='driver' WHERE d.id=_id AND d.docs_status='approved' AND p.account_status='active' AND p.deleted_at IS NULL AND (d.existing_customer OR p.approval_status='approved'));
$$;
REVOKE ALL ON FUNCTION public.is_approved_driver(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_approved_driver(uuid) TO authenticated;

CREATE FUNCTION public.start_driver_application() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _id uuid:=auth.uid();
BEGIN
IF _id IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
PERFORM 1 FROM public.profiles WHERE id=_id AND account_status='active' AND deleted_at IS NULL FOR UPDATE;
IF NOT FOUND OR NOT public.has_role(_id,'customer') OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_id AND role IN ('admin','support_agent','vendor')) THEN RAISE EXCEPTION 'customer_required'; END IF;
IF public.has_role(_id,'driver') THEN RETURN; END IF;
INSERT INTO public.user_roles(user_id,role) VALUES(_id,'driver');
INSERT INTO public.drivers(id,country,existing_customer,status,docs_status) SELECT _id,country,true,'offline','draft' FROM public.profiles WHERE id=_id;
END; $$;
REVOKE ALL ON FUNCTION public.start_driver_application() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.start_driver_application() TO authenticated;

CREATE FUNCTION public.switch_account_mode(_mode text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _id uuid:=auth.uid();
BEGIN
IF _id IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
PERFORM 1 FROM public.profiles WHERE id=_id AND account_status='active' AND deleted_at IS NULL FOR UPDATE;
IF NOT FOUND OR _mode NOT IN ('customer','driver') OR NOT public.has_role(_id,'customer') OR NOT public.has_role(_id,'driver') OR EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_id AND role IN ('admin','support_agent','vendor')) THEN RAISE EXCEPTION 'mode_not_allowed'; END IF;
PERFORM 1 FROM public.drivers WHERE id=_id FOR UPDATE;
IF EXISTS(SELECT 1 FROM public.orders WHERE driver_id=_id AND status NOT IN ('delivered','cancelled')) THEN RAISE EXCEPTION 'active_delivery'; END IF;
IF _mode='customer' THEN UPDATE public.drivers SET status='offline' WHERE id=_id; END IF;
UPDATE public.profiles SET preferred_mode=_mode WHERE id=_id;
END; $$;
REVOKE ALL ON FUNCTION public.switch_account_mode(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.switch_account_mode(text) TO authenticated;

CREATE FUNCTION public.submit_driver_application(_accept_terms boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _id uuid:=auth.uid(); _d public.drivers; _required text[];
BEGIN
IF _id IS NULL OR NOT public.has_role(_id,'driver') THEN RAISE EXCEPTION 'driver_required'; END IF;
SELECT * INTO _d FROM public.drivers WHERE id=_id FOR UPDATE;
IF NOT FOUND OR _d.docs_status='approved' THEN RAISE EXCEPTION 'application_locked'; END IF;
IF NOT COALESCE(_accept_terms,false) THEN RAISE EXCEPTION 'terms_required'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_id AND phone ~ '^\+[1-9][0-9]{6,14}$' AND account_status='active') THEN RAISE EXCEPTION 'phone_required'; END IF;
IF _d.vehicle_type IS NULL OR _d.vehicle_type NOT IN ('Bicycle','E-bike','Scooter','On foot','Motorbike','Car') THEN RAISE EXCEPTION 'vehicle_required'; END IF;
_required:=ARRAY['profile_photo','id_card','insulated_bag'];
IF _d.vehicle_type<>'On foot' THEN _required:=_required||ARRAY['vehicle_photo']; END IF;
IF _d.vehicle_type IN ('Car','Motorbike') THEN _required:=_required||ARRAY['drivers_licence','insurance','vehicle_registration']; END IF;
IF EXISTS(SELECT 1 FROM unnest(_required) x WHERE NOT EXISTS(SELECT 1 FROM public.driver_documents WHERE driver_id=_id AND doc_type=x AND file_path LIKE _id::text||'/%' AND status<>'rejected')) THEN RAISE EXCEPTION 'documents_required'; END IF;
UPDATE public.drivers SET docs_status='in_review',submitted_at=now(),terms_accepted_at=now(),status='offline' WHERE id=_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_driver_application(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_driver_application(boolean) TO authenticated;

CREATE FUNCTION public.guard_driver_application() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
IF current_user IN ('authenticated','anon') AND NOT private.is_platform_admin() THEN
IF TG_OP='INSERT' THEN
IF NEW.docs_status<>'draft' OR NEW.status<>'offline' OR NEW.existing_customer OR NEW.terms_accepted_at IS NOT NULL OR NEW.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
ELSE
IF NEW.docs_status IS DISTINCT FROM OLD.docs_status AND NOT (NOT OLD.existing_customer AND NEW.docs_status='in_review' AND OLD.docs_status IN ('draft','rejected','in_review')) THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
IF NEW.existing_customer IS DISTINCT FROM OLD.existing_customer OR NEW.terms_accepted_at IS DISTINCT FROM OLD.terms_accepted_at OR NEW.country IS DISTINCT FROM OLD.country THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
IF NEW.submitted_at IS DISTINCT FROM OLD.submitted_at AND NEW.docs_status<>'in_review' THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
IF OLD.docs_status IN ('in_review','approved') AND (NEW.vehicle_type IS DISTINCT FROM OLD.vehicle_type OR NEW.vehicle_model IS DISTINCT FROM OLD.vehicle_model OR NEW.plate IS DISTINCT FROM OLD.plate) THEN RAISE EXCEPTION 'application_locked'; END IF;
END IF;
IF NEW.status<>'offline' AND NOT public.is_approved_driver(NEW.id) THEN RAISE EXCEPTION 'driver_not_approved'; END IF;
IF TG_OP='UPDATE' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status='offline' AND EXISTS(SELECT 1 FROM public.orders WHERE driver_id=NEW.id AND status NOT IN ('delivered','cancelled')) THEN RAISE EXCEPTION 'active_delivery'; END IF;
END IF;
IF NEW.docs_status='rejected' THEN NEW.status:='offline'; END IF;
RETURN NEW;
END; $$;
CREATE TRIGGER guard_driver_application BEFORE INSERT OR UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.guard_driver_application();

CREATE FUNCTION public.guard_driver_document_review() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
IF current_user IN ('authenticated','anon') AND NOT private.is_platform_admin() THEN
IF NOT public.has_role(auth.uid(),'driver') OR NEW.driver_id<>auth.uid() THEN RAISE EXCEPTION 'driver_required'; END IF;
IF TG_OP='UPDATE' AND (NEW.driver_id IS DISTINCT FROM OLD.driver_id OR NEW.doc_type IS DISTINCT FROM OLD.doc_type) THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
IF NEW.status<>'pending' OR NEW.review_note IS NOT NULL THEN RAISE EXCEPTION 'review_fields_protected'; END IF;
IF NEW.file_path NOT LIKE auth.uid()::text||'/%' THEN RAISE EXCEPTION 'invalid_document_path'; END IF;
END IF;
RETURN NEW;
END; $$;
CREATE TRIGGER guard_driver_document_review BEFORE INSERT OR UPDATE ON public.driver_documents FOR EACH ROW EXECUTE FUNCTION public.guard_driver_document_review();

CREATE FUNCTION public.guard_driver_work() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
IF NEW.driver_id IS NOT NULL AND (TG_OP='INSERT' OR NEW.driver_id IS DISTINCT FROM OLD.driver_id OR NEW.status IS DISTINCT FROM OLD.status) THEN
PERFORM 1 FROM public.drivers WHERE id=NEW.driver_id FOR UPDATE;
IF NOT public.is_approved_driver(NEW.driver_id) AND NOT private.is_staff() AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'driver_not_approved'; END IF;
END IF;
RETURN NEW;
END; $$;
CREATE TRIGGER guard_driver_work BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_driver_work();

CREATE POLICY "Driver reads require approval" ON public.orders AS RESTRICTIVE FOR SELECT TO authenticated USING (driver_id=auth.uid() OR customer_id=auth.uid() OR private.is_staff() OR EXISTS(SELECT 1 FROM public.restaurants WHERE id=restaurant_id AND owner_id=auth.uid()) OR public.is_approved_driver(auth.uid()));
CREATE POLICY "Driver writes require approval" ON public.orders AS RESTRICTIVE FOR UPDATE TO authenticated USING (customer_id=auth.uid() OR private.is_staff() OR EXISTS(SELECT 1 FROM public.restaurants WHERE id=restaurant_id AND owner_id=auth.uid()) OR public.is_approved_driver(auth.uid())) WITH CHECK (customer_id=auth.uid() OR private.is_staff() OR EXISTS(SELECT 1 FROM public.restaurants WHERE id=restaurant_id AND owner_id=auth.uid()) OR public.is_approved_driver(auth.uid()));
CREATE POLICY "Approved drivers publish locations" ON public.driver_locations AS RESTRICTIVE FOR ALL TO authenticated USING (driver_id<>auth.uid() OR public.is_approved_driver(auth.uid())) WITH CHECK (driver_id=auth.uid() AND public.is_approved_driver(auth.uid()));

CREATE FUNCTION public.notify_driver_application() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _recipient record; _event text; _lang text; _title text; _body text;
BEGIN
IF TG_OP='INSERT' AND NEW.existing_customer THEN _event:='started';
ELSIF TG_OP='UPDATE' AND NEW.docs_status IS DISTINCT FROM OLD.docs_status AND NEW.docs_status IN ('in_review','approved','rejected') THEN _event:=NEW.docs_status;
ELSE RETURN NEW; END IF;
FOR _recipient IN SELECT p.id,p.language FROM public.profiles p WHERE ((_event IN ('started','in_review') AND public.has_role(p.id,'admin')) OR (_event IN ('approved','rejected') AND p.id=NEW.id)) AND p.account_status='active' LOOP
_lang:=COALESCE(_recipient.language,'en');
_title:=CASE _event WHEN 'approved' THEN CASE _lang WHEN 'pl' THEN 'Zgłoszenie kierowcy zatwierdzone' WHEN 'uk' THEN 'Заявку водія схвалено' WHEN 'fr' THEN 'Candidature chauffeur approuvée' ELSE 'Driver application approved' END WHEN 'rejected' THEN CASE _lang WHEN 'pl' THEN 'Zgłoszenie kierowcy odrzucone' WHEN 'uk' THEN 'Заявку водія відхилено' WHEN 'fr' THEN 'Candidature chauffeur refusée' ELSE 'Driver application rejected' END ELSE CASE _lang WHEN 'pl' THEN 'Nowe zgłoszenie kierowcy' WHEN 'uk' THEN 'Нова заявка водія' WHEN 'fr' THEN 'Nouvelle candidature chauffeur' ELSE 'New driver application' END END;
_body:=CASE _event WHEN 'approved' THEN CASE _lang WHEN 'pl' THEN 'Możesz przełączyć się na tryb kierowcy i przejść online.' WHEN 'uk' THEN 'Ви можете перейти в режим водія та вийти онлайн.' WHEN 'fr' THEN 'Vous pouvez passer en mode chauffeur et vous connecter.' ELSE 'You can switch to Driver mode and go online.' END WHEN 'rejected' THEN CASE _lang WHEN 'pl' THEN 'Otwórz Dokumenty, sprawdź uwagi i popraw zgłoszenie.' WHEN 'uk' THEN 'Відкрийте Документи, перегляньте зауваження та виправте заявку.' WHEN 'fr' THEN 'Ouvrez Documents, consultez les remarques et corrigez votre candidature.' ELSE 'Open Documents, check the review notes and update your application.' END ELSE CASE _lang WHEN 'pl' THEN 'Sprawdź zgłoszenie w panelu oczekujących zatwierdzeń.' WHEN 'uk' THEN 'Перевірте заявку в розділі очікування схвалення.' WHEN 'fr' THEN 'Consultez la candidature dans les approbations en attente.' ELSE 'Check the application in Pending Approvals.' END END;
PERFORM private.notify_user(_recipient.id,'driver_application_'||_event,_title,_body,NULL,CASE WHEN _event IN ('started','in_review') THEN '/admin/approvals' ELSE '/driver/documents' END,true);
END LOOP;
RETURN NEW;
END; $$;
CREATE TRIGGER notify_driver_application AFTER INSERT OR UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.notify_driver_application();