REVOKE ALL ON FUNCTION public.open_chat_thread(text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_chat_thread(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.on_chat_message() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_chat_thread(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_chat_thread(uuid) TO authenticated;