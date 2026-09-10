CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  host_name TEXT NOT NULL DEFAULT '',
  barber_slug TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'camera',
  external_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'live',
  viewers INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_streams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_streams TO authenticated;
GRANT ALL ON public.live_streams TO service_role;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_streams_public_read" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "live_streams_host_insert" ON public.live_streams FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "live_streams_host_update" ON public.live_streams FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "live_streams_host_delete" ON public.live_streams FOR DELETE TO authenticated USING (host_id = auth.uid());
CREATE POLICY "live_streams_staff_update" ON public.live_streams FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator')) WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));
CREATE POLICY "live_streams_staff_delete" ON public.live_streams FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.live_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.live_messages TO authenticated;
GRANT ALL ON public.live_messages TO service_role;
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_messages_public_read" ON public.live_messages FOR SELECT USING (true);
CREATE POLICY "live_messages_own_insert" ON public.live_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "live_messages_own_delete" ON public.live_messages FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "live_messages_staff_delete" ON public.live_messages FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

CREATE INDEX live_messages_stream_idx ON public.live_messages (stream_id, created_at);
CREATE INDEX live_streams_status_idx ON public.live_streams (status, started_at DESC);