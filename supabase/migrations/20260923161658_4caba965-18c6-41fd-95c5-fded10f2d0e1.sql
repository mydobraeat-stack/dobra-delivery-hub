
-- Keep profile rows (and therefore order history) after the auth user is deleted.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE OR REPLACE FUNCTION public.anonymize_account(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Scrub personal identifying information but keep the row so orders stay intact.
  UPDATE public.profiles
  SET email = NULL,
      full_name = 'Deleted user',
      phone = NULL,
      avatar_url = NULL,
      country = NULL,
      deleted_at = now()
  WHERE id = _user_id;

  DELETE FROM public.notifications WHERE user_id = _user_id;
  DELETE FROM public.push_subscriptions WHERE user_id = _user_id;
  DELETE FROM public.driver_documents WHERE driver_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;

  UPDATE public.chat_messages
  SET body = '[deleted]', attachment_url = NULL, attachment_name = NULL, attachment_type = NULL
  WHERE sender_id = _user_id;

  UPDATE public.drivers SET status = 'offline' WHERE id = _user_id;
  DELETE FROM public.driver_locations WHERE driver_id = _user_id;

  UPDATE public.restaurants SET is_open = false, status = 'removed' WHERE owner_id = _user_id;

  UPDATE public.reviews SET comment = NULL WHERE customer_id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_account(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_account(uuid) TO service_role;
