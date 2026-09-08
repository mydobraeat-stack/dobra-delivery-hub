CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions (user_id);

CREATE TRIGGER push_subscriptions_set_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.dispatch_web_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text := 'https://project--97c48d84-6cb7-49c1-8422-6dbf9f32e9a0.lovable.app/api/public/push/dispatch';
  _secret text := '2a72621c496a9e02962338156ea819f3558b0936e7be9a29';
BEGIN
  IF NOT NEW.sound THEN
    RETURN NEW;
  END IF;

  PERFORM extensions.net_http_post(
    url := _url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', _secret),
    body := jsonb_build_object('notification_id', NEW.id),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.dispatch_web_push() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER notifications_web_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.dispatch_web_push();