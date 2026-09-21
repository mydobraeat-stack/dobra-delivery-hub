CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('order_driver','order_vendor','support')),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  counterpart_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX chat_threads_order_kind_key ON public.chat_threads (order_id, kind) WHERE order_id IS NOT NULL;
CREATE UNIQUE INDEX chat_threads_support_key ON public.chat_threads (customer_id) WHERE kind = 'support';
CREATE INDEX chat_threads_customer_idx ON public.chat_threads (customer_id, last_message_at DESC);
CREATE INDEX chat_threads_counterpart_idx ON public.chat_threads (counterpart_id, last_message_at DESC);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_thread_idx ON public.chat_messages (thread_id, created_at);

GRANT SELECT, INSERT, UPDATE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

CREATE OR REPLACE FUNCTION public.can_access_chat_thread(_thread_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_threads t
    WHERE t.id = _thread_id
      AND (
        t.customer_id = auth.uid()
        OR t.counterpart_id = auth.uid()
        OR (t.kind = 'support' AND public.has_role(auth.uid(), 'admin'))
        OR (t.kind = 'order_driver' AND EXISTS (
              SELECT 1 FROM public.orders o WHERE o.id = t.order_id AND o.driver_id = auth.uid()))
        OR (t.kind = 'order_vendor' AND EXISTS (
              SELECT 1 FROM public.orders o
              JOIN public.restaurants r ON r.id = o.restaurant_id
              WHERE o.id = t.order_id AND r.owner_id = auth.uid()))
      )
  );
$$;

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read their chats"
  ON public.chat_threads FOR SELECT TO authenticated
  USING (public.can_access_chat_thread(id));

CREATE POLICY "Participants update their chats"
  ON public.chat_threads FOR UPDATE TO authenticated
  USING (public.can_access_chat_thread(id))
  WITH CHECK (public.can_access_chat_thread(id));

CREATE POLICY "Participants read chat messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (public.can_access_chat_thread(thread_id));

CREATE POLICY "Participants send chat messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.can_access_chat_thread(thread_id));

CREATE POLICY "Participants mark chat messages read"
  ON public.chat_messages FOR UPDATE TO authenticated
  USING (public.can_access_chat_thread(thread_id))
  WITH CHECK (public.can_access_chat_thread(thread_id));

CREATE OR REPLACE FUNCTION public.open_chat_thread(_kind text, _order_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _thread uuid;
  _customer uuid;
  _counterpart uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF _kind = 'support' THEN
    SELECT id INTO _thread FROM public.chat_threads WHERE kind = 'support' AND customer_id = _uid;
    IF _thread IS NULL THEN
      INSERT INTO public.chat_threads (kind, customer_id) VALUES ('support', _uid) RETURNING id INTO _thread;
    END IF;
    RETURN _thread;
  END IF;

  IF _kind NOT IN ('order_driver','order_vendor') OR _order_id IS NULL THEN
    RAISE EXCEPTION 'Invalid chat request';
  END IF;

  IF _kind = 'order_driver' THEN
    SELECT o.customer_id, o.driver_id INTO _customer, _counterpart
    FROM public.orders o WHERE o.id = _order_id;
  ELSE
    SELECT o.customer_id, r.owner_id INTO _customer, _counterpart
    FROM public.orders o JOIN public.restaurants r ON r.id = o.restaurant_id
    WHERE o.id = _order_id;
  END IF;

  IF _customer IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  IF _uid <> _customer AND (_counterpart IS NULL OR _uid <> _counterpart) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT id INTO _thread FROM public.chat_threads WHERE order_id = _order_id AND kind = _kind;
  IF _thread IS NULL THEN
    INSERT INTO public.chat_threads (kind, order_id, customer_id, counterpart_id)
    VALUES (_kind, _order_id, _customer, _counterpart) RETURNING id INTO _thread;
  ELSIF _counterpart IS NOT NULL THEN
    UPDATE public.chat_threads SET counterpart_id = _counterpart, updated_at = now()
    WHERE id = _thread AND counterpart_id IS DISTINCT FROM _counterpart;
  END IF;

  RETURN _thread;
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_chat_thread(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat_thread(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.on_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _t public.chat_threads%ROWTYPE;
  _sender text;
  _recipient uuid;
  _title text;
BEGIN
  SELECT * INTO _t FROM public.chat_threads WHERE id = NEW.thread_id;
  UPDATE public.chat_threads SET last_message_at = NEW.created_at, updated_at = now() WHERE id = NEW.thread_id;

  SELECT COALESCE(p.full_name, 'Someone') INTO _sender FROM public.profiles p WHERE p.id = NEW.sender_id;

  IF _t.kind = 'support' THEN
    IF NEW.sender_id = _t.customer_id THEN
      PERFORM private.notify_admins('chat_message', 'Support message from ' || _sender,
        left(NEW.body, 120), '/admin/support', true);
      RETURN NEW;
    END IF;
    _recipient := _t.customer_id;
    _title := 'Message from Dobra support';
  ELSE
    IF NEW.sender_id = _t.customer_id THEN
      _recipient := _t.counterpart_id;
    ELSE
      _recipient := _t.customer_id;
    END IF;
    _title := 'New message from ' || _sender;
  END IF;

  IF _recipient IS NOT NULL THEN
    PERFORM private.notify_user(_recipient, 'chat_message', _title, left(NEW.body, 120),
      _t.order_id, '/chat/' || _t.id, true);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER chat_messages_after_insert
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.on_chat_message();

CREATE TRIGGER chat_threads_set_updated_at
BEFORE UPDATE ON public.chat_threads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_threads;