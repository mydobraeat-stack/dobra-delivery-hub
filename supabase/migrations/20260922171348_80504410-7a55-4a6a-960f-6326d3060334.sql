ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_body_check;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_body_check
  CHECK (char_length(body) <= 2000 AND (char_length(btrim(body)) >= 1 OR attachment_url IS NOT NULL));

CREATE OR REPLACE FUNCTION public.can_view_chat_file(_object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.attachment_url = 'chat-uploads/' || _object_name
      AND public.can_access_chat_thread(m.thread_id)
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_view_chat_file(text) TO authenticated;

DROP POLICY IF EXISTS "Chat upload own files" ON storage.objects;
CREATE POLICY "Chat upload own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Chat read own or thread files" ON storage.objects;
CREATE POLICY "Chat read own or thread files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-uploads'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.can_view_chat_file(name))
  );