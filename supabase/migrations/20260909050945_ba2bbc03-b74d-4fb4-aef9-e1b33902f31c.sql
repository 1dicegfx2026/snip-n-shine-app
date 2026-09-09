REVOKE EXECUTE ON FUNCTION public.owns_pro_page(TEXT, UUID) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;