CREATE TABLE public.platform_settings (
  id text PRIMARY KEY DEFAULT 'main',
  commission_rate numeric NOT NULL DEFAULT 0.10,
  default_deposit_rate numeric NOT NULL DEFAULT 0.25,
  pay_card boolean NOT NULL DEFAULT true,
  pay_zelle boolean NOT NULL DEFAULT true,
  pay_cashapp boolean NOT NULL DEFAULT true,
  pay_cash boolean NOT NULL DEFAULT true,
  announcement text NOT NULL DEFAULT '',
  support_email text NOT NULL DEFAULT '',
  bookings_open boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON public.platform_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_write" ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_settings (id) VALUES ('main') ON CONFLICT DO NOTHING;

CREATE POLICY "bookings_mod_write" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "pro_pages_mod_write" ON public.pro_pages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "client_profiles_mod_write" ON public.client_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'moderator'));