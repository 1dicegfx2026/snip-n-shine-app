CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY user_roles_read ON public.user_roles;
CREATE POLICY user_roles_read ON public.user_roles FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY user_roles_admin_write ON public.user_roles;
CREATE POLICY user_roles_admin_write ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY profiles_admin_write ON public.profiles;
CREATE POLICY profiles_admin_write ON public.profiles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY bookings_admin_write ON public.bookings;
CREATE POLICY bookings_admin_write ON public.bookings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY bookings_mod_write ON public.bookings;
CREATE POLICY bookings_mod_write ON public.bookings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'moderator')) WITH CHECK (private.has_role(auth.uid(), 'moderator'));

DROP POLICY pro_pages_admin_write ON public.pro_pages;
CREATE POLICY pro_pages_admin_write ON public.pro_pages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY pro_pages_mod_write ON public.pro_pages;
CREATE POLICY pro_pages_mod_write ON public.pro_pages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'moderator')) WITH CHECK (private.has_role(auth.uid(), 'moderator'));

DROP POLICY client_profiles_admin_write ON public.client_profiles;
CREATE POLICY client_profiles_admin_write ON public.client_profiles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY client_profiles_mod_write ON public.client_profiles;
CREATE POLICY client_profiles_mod_write ON public.client_profiles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'moderator')) WITH CHECK (private.has_role(auth.uid(), 'moderator'));

DROP POLICY settings_admin_write ON public.platform_settings;
CREATE POLICY settings_admin_write ON public.platform_settings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY reviews_staff_write ON public.reviews;
CREATE POLICY reviews_staff_write ON public.reviews FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.claim_admin();