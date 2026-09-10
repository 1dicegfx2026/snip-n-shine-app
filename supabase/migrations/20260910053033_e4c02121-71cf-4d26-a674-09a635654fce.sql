ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reply text NOT NULL DEFAULT '';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reply_at timestamptz;

DROP POLICY IF EXISTS reviews_owner_reply ON public.reviews;
CREATE POLICY reviews_owner_reply ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.owns_pro_page(barber_slug, auth.uid()))
  WITH CHECK (public.owns_pro_page(barber_slug, auth.uid()));

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_own ON public.notifications;
CREATE POLICY notifications_own ON public.notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_staff_insert ON public.notifications;
CREATE POLICY notifications_staff_insert ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);