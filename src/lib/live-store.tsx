import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type LiveMode = "camera" | "external";
export type LiveStatus = "live" | "ended";

export interface LiveStream {
  id: string;
  hostId: string;
  hostName: string;
  barberSlug: string;
  title: string;
  description: string;
  mode: LiveMode;
  externalUrl: string;
  status: LiveStatus;
  viewers: number;
  startedAt: number;
  endedAt: number | null;
}

interface Row {
  id: string;
  host_id: string;
  host_name: string;
  barber_slug: string;
  title: string;
  description: string;
  mode: string;
  external_url: string;
  status: string;
  viewers: number;
  started_at: string;
  ended_at: string | null;
}

interface Store {
  hydrated: boolean;
  streams: LiveStream[];
  live: LiveStream[];
  getStream: (id: string) => LiveStream | undefined;
  startStream: (input: {
    title: string;
    description?: string;
    mode: LiveMode;
    externalUrl?: string;
    barberSlug?: string;
    hostName?: string;
  }) => Promise<string>;
  endStream: (id: string) => Promise<void>;
  deleteStream: (id: string) => Promise<void>;
  setViewers: (id: string, viewers: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

const toStream = (r: Row): LiveStream => ({
  id: r.id,
  hostId: r.host_id,
  hostName: r.host_name,
  barberSlug: r.barber_slug,
  title: r.title,
  description: r.description,
  mode: r.mode === "external" ? "external" : "camera",
  externalUrl: r.external_url,
  status: r.status === "ended" ? "ended" : "live",
  viewers: r.viewers,
  startedAt: new Date(r.started_at).getTime(),
  endedAt: r.ended_at ? new Date(r.ended_at).getTime() : null,
});

export function LiveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = async () => {
    const { data } = await supabase
      .from("live_streams")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(60);
    if (data) setStreams((data as unknown as Row[]).map(toStream));
    setHydrated(true);
  };

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("live-streams-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_streams" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const store: Store = {
    hydrated,
    refresh,
    streams,
    live: streams.filter((s) => s.status === "live"),
    getStream: (id) => streams.find((s) => s.id === id),
    startStream: async (input) => {
      if (!user) throw new Error("Tienes que iniciar sesión para transmitir.");
      const { data, error } = await supabase
        .from("live_streams")
        .insert({
          host_id: user.id,
          host_name: input.hostName ?? "",
          barber_slug: input.barberSlug ?? "",
          title: input.title,
          description: input.description ?? "",
          mode: input.mode,
          external_url: input.externalUrl ?? "",
          status: "live",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await refresh();
      return (data as { id: string }).id;
    },
    endStream: async (id) => {
      const { error } = await supabase
        .from("live_streams")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await refresh();
    },
    deleteStream: async (id) => {
      const { error } = await supabase.from("live_streams").delete().eq("id", id);
      if (error) throw new Error(error.message);
      await refresh();
    },
    setViewers: async (id, viewers) => {
      await supabase.from("live_streams").update({ viewers }).eq("id", id);
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useLive(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLive must be used inside LiveProvider");
  return ctx;
}

/** Convierte un enlace de YouTube / Twitch / TikTok en un embed que se puede ver dentro de GILT. */
export function embedUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      if (u.pathname.startsWith("/live/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}?autoplay=1`;
      if (u.pathname.startsWith("/embed/")) return url;
      const handle = u.pathname.replace("/", "");
      if (handle) return `https://www.youtube.com/embed/live_stream?channel=${handle}`;
      return null;
    }
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}?autoplay=1`;
    if (host === "twitch.tv") {
      const channel = u.pathname.replace("/", "");
      return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
    }
    if (host.endsWith("tiktok.com") || host.endsWith("instagram.com") || host.endsWith("facebook.com")) {
      return null; // no permiten embed: se abre en pestaña nueva
    }
    return null;
  } catch {
    return null;
  }
}
