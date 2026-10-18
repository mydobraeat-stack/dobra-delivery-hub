CREATE OR REPLACE FUNCTION private.is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.profiles p ON p.id=ur.user_id WHERE ur.user_id=auth.uid() AND ur.role='admin' AND p.account_status='active' AND p.deleted_at IS NULL); $$;
CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.profiles p ON p.id=ur.user_id WHERE ur.user_id=auth.uid() AND ur.role IN ('admin','support_agent') AND p.account_status='active' AND p.deleted_at IS NULL); $$;

CREATE OR REPLACE FUNCTION public.admin_cancel_order(_order uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE o public.orders%ROWTYPE; BEGIN
IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
IF coalesce(btrim(_reason),'')='' THEN RAISE EXCEPTION 'A reason is required'; END IF;
SELECT * INTO o FROM public.orders WHERE id=_order FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
IF o.status IN ('delivered','cancelled') THEN RAISE EXCEPTION 'Closed orders cannot be changed'; END IF;
UPDATE public.orders SET status='cancelled',cancel_reason=btrim(_reason) WHERE id=_order;
PERFORM private.log_admin('order_cancelled','order',_order::text,jsonb_build_object('reason',btrim(_reason),'previous_status',o.status));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_force_status(_order uuid, _status text, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE o public.orders%ROWTYPE; next_status text; BEGIN
IF NOT private.is_platform_admin() THEN RAISE EXCEPTION 'Only super admins can change order status manually'; END IF;
IF coalesce(btrim(_reason),'')='' THEN RAISE EXCEPTION 'A reason is required'; END IF;
SELECT * INTO o FROM public.orders WHERE id=_order FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
IF o.status IN ('delivered','cancelled') THEN RAISE EXCEPTION 'Closed orders cannot be changed'; END IF;
IF _status='cancelled' THEN PERFORM public.admin_cancel_order(_order,_reason); RETURN; END IF;
IF o.payment_method IS DISTINCT FROM 'cash' AND o.payment_status IS DISTINCT FROM 'paid' THEN RAISE EXCEPTION 'Online payment must be confirmed before progressing the order'; END IF;
IF o.kind='package' THEN
next_status := CASE o.status WHEN 'ready' THEN 'picked_up' WHEN 'picked_up' THEN 'delivered' END;
ELSE
next_status := CASE o.status WHEN 'pending' THEN 'accepted' WHEN 'accepted' THEN 'preparing' WHEN 'preparing' THEN 'ready' WHEN 'ready' THEN 'picked_up' WHEN 'picked_up' THEN 'delivered' END;
END IF;
IF next_status IS NULL OR _status IS DISTINCT FROM next_status THEN RAISE EXCEPTION 'Only the next order stage is allowed'; END IF;
IF _status IN ('picked_up','delivered') AND o.driver_id IS NULL THEN RAISE EXCEPTION 'Assign a driver before pickup or delivery'; END IF;
UPDATE public.orders SET status=_status,delivered_at=CASE WHEN _status='delivered' THEN now() ELSE delivered_at END WHERE id=_order;
PERFORM private.log_admin('order_status_forced','order',_order::text,jsonb_build_object('status',_status,'previous_status',o.status,'reason',btrim(_reason)));
END; $$;

CREATE OR REPLACE FUNCTION public.admin_reassign_driver(_order uuid, _driver uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ DECLARE o public.orders%ROWTYPE; BEGIN
IF NOT private.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
SELECT * INTO o FROM public.orders WHERE id=_order FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
IF o.status IN ('delivered','cancelled','picked_up') THEN RAISE EXCEPTION 'Driver cannot be changed after pickup or closure'; END IF;
IF o.payment_method IS DISTINCT FROM 'cash' AND o.payment_status IS DISTINCT FROM 'paid' THEN RAISE EXCEPTION 'Online payment must be confirmed before driver assignment'; END IF;
IF o.driver_id IS NOT DISTINCT FROM _driver THEN RAISE EXCEPTION 'Choose a different driver'; END IF;
IF _driver IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.profiles p ON p.id=ur.user_id WHERE ur.user_id=_driver AND ur.role='driver' AND p.approval_status='approved' AND p.account_status='active' AND p.deleted_at IS NULL) THEN RAISE EXCEPTION 'That driver is not approved or is suspended'; END IF;
UPDATE public.orders SET driver_id=_driver WHERE id=_order;
PERFORM private.log_admin(CASE WHEN _driver IS NULL THEN 'driver_unassigned' ELSE 'driver_reassigned' END,'order',_order::text,jsonb_build_object('driver_id',_driver,'previous_driver_id',o.driver_id));
END; $$;

CREATE OR REPLACE FUNCTION public.guard_direct_staff_order_updates()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN
IF current_user IN ('authenticated','anon') AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role IN ('admin','support_agent')) THEN
RAISE EXCEPTION 'Staff order changes must use audited admin actions';
END IF;
RETURN NEW;
END; $$;
CREATE TRIGGER guard_direct_staff_order_updates BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_direct_staff_order_updates();
REVOKE ALL ON FUNCTION public.guard_direct_staff_order_updates() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order(uuid,text),public.admin_force_status(uuid,text,text),public.admin_reassign_driver(uuid,uuid) TO authenticated;
