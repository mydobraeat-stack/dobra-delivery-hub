CREATE OR REPLACE FUNCTION public.dispatch_web_push()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _url text := 'https://project--97c48d84-6cb7-49c1-8422-6dbf9f32e9a0.lovable.app/api/public/push/dispatch';
  _secret text := '2a72621c496a9e02962338156ea819f3558b0936e7be9a29';
BEGIN
  IF NOT NEW.sound THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', _secret),
    body := jsonb_build_object('notification_id', NEW.id),
    timeout_milliseconds := 5000
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'dispatch_web_push failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;