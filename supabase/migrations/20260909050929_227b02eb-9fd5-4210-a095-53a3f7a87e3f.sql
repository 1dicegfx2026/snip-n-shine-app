CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.pro_pages (
  handle TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  data JSONB NOT NULL,
  deposit_rate NUMERIC NOT NULL DEFAULT 0.25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pro_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pro_pages TO authenticated;
GRANT ALL ON public.pro_pages TO service_role;
ALTER TABLE public.pro_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pro_pages_public_read" ON public.pro_pages FOR SELECT USING (true);
CREATE POLICY "pro_pages_own_write" ON public.pro_pages FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.client_profiles (
  handle TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.client_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_profiles TO authenticated;
GRANT ALL ON public.client_profiles TO service_role;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_profiles_public_read" ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "client_profiles_own_write" ON public.client_profiles FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users ON DELETE SET NULL,
  barber_slug TEXT NOT NULL,
  service_id TEXT NOT NULL,
  date_iso DATE NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  pay_type TEXT NOT NULL DEFAULT 'deposit',
  pay_method TEXT,
  deposit_rate NUMERIC NOT NULL DEFAULT 0.25,
  commission_rate NUMERIC NOT NULL DEFAULT 0.1,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  refunded NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_pro_page(_slug TEXT, _user UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.pro_pages WHERE handle = _slug AND owner_id = _user);
$$;

CREATE POLICY "bookings_read" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = client_id OR public.owns_pro_page(barber_slug, auth.uid()))
  WITH CHECK (auth.uid() = client_id OR public.owns_pro_page(barber_slug, auth.uid()));
CREATE POLICY "bookings_delete" ON public.bookings FOR DELETE TO authenticated
  USING (auth.uid() = client_id OR public.owns_pro_page(barber_slug, auth.uid()));

CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users ON DELETE CASCADE,
  barber_slug TEXT NOT NULL,
  date_iso DATE NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_read" ON public.waitlist FOR SELECT TO authenticated USING (true);
CREATE POLICY "waitlist_write" ON public.waitlist FOR ALL TO authenticated USING (auth.uid() = client_id OR public.owns_pro_page(barber_slug, auth.uid())) WITH CHECK (auth.uid() = client_id);