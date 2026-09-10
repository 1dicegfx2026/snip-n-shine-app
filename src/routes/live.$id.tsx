import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Users, Radio, ExternalLink, Square, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useAdmin } from "@/lib/admin";
import { useLive, embedUrl } from "@/lib/live-store";
import { startHosting, startViewing, type HostSession, type ViewerSession } from "@/lib/live-webrtc";
import { LiveChat } from "@/components/LiveChat";
import { ShareButton } from "@/components/ShareButton";

export const Route = createFileRoute("/live/$id")({
  head: () => ({
    meta: [
      { title: "Transmisión en vivo — GILT" },
      {
        name: "description",
        content: "Mira el corte en vivo, escribe en el chat y reserva tu cita con el barbero al momento.",
      },
      { property: "og:title", content: "Transmisión en vivo — GILT" },
      { property: "og:description", content: "Corte en vivo, chat y reserva directa en GILT." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveRoomPage,
});

function LiveRoomPage() {
  const { id } = Route.useParams();
  const { getStream, endStream, setViewers, hydrated } = useLive();
  const { user } = useAuth();
  const admin = useAdmin();
  const stream = getStream(id);
  const isHost = !!user && stream?.hostId === user.id;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HostSession | null>(null);
  const viewerRef = useRef<ViewerSession | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"connecting" | "live" | "offline">("connecting");
  const [viewerCount, setViewerCount] = useState(0);
  const [ending, setEnding] = useState(false);

  const mode = stream?.mode;
  const status = stream?.status;

  // Barbero: abre la cámara y transmite
  useEffect(() => {
    if (!isHost || mode !== "camera" || status !== "live") return;
    let cancelled = false;
    (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaRef.current = media;
        if (videoRef.current) videoRef.current.srcObject = media;
        setState("live");
        const session = startHosting(id, media);
        session.onViewers((n) => {
          setViewerCount(n);
          void setViewers(id, n);
        });
        hostRef.current = session;
      } catch {
        toast.error("No pudimos abrir la cámara. Da permiso al navegador y recarga.");
        setState("offline");
      }
    })();
    return () => {
      cancelled = true;
      hostRef.current?.stop();
      hostRef.current = null;
      mediaRef.current?.getTracks().forEach((t) => t.stop());
      mediaRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, mode, status, id]);

  // Espectador: recibe el video del barbero
  useEffect(() => {
    if (isHost || mode !== "camera" || status !== "live") return;
    const session = startViewing(
      id,
      (remote) => {
        if (videoRef.current) videoRef.current.srcObject = remote;
      },
      setState,
    );
    viewerRef.current = session;
    return () => {
      session.stop();
      viewerRef.current = null;
    };
  }, [isHost, mode, status, id]);

  if (!hydrated && !stream) {
    return <p className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground">Cargando transmisión…</p>;
  }

  if (!stream) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Esta transmisión no existe</h1>
        <Link to="/live" className="mt-4 inline-block text-gold hover:underline">
          Ver quién está en vivo
        </Link>
      </div>
    );
  }

  const embed = stream.mode === "external" ? embedUrl(stream.externalUrl) : null;

  const finish = async () => {
    setEnding(true);
    try {
      hostRef.current?.stop();
      mediaRef.current?.getTracks().forEach((t) => t.stop());
      await endStream(stream.id);
      toast.success("Transmisión terminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo terminar la transmisión.");
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-widest">
            {stream.status === "live" ? (
              <span className="flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-black text-destructive-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> EN VIVO
              </span>
            ) : (
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-black text-muted-foreground">
                TERMINADA
              </span>
            )}
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users size={12} /> {isHost ? viewerCount : stream.viewers}
            </span>
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{stream.title}</h1>
          <p className="mt-1 text-sm text-gold">{stream.hostName || "Pro GILT"}</p>
          {stream.description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{stream.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareButton title={`${stream.title} en vivo en GILT`} path={`/live/${stream.id}`} />
          {stream.barberSlug && (
            <Link
              to="/pro/$handle"
              params={{ handle: stream.barberSlug }}
              className="flex items-center gap-2 rounded-lg border border-gold px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
            >
              <CalendarPlus size={14} /> Ver perfil y reservar
            </Link>
          )}
          {(isHost || admin.canEdit) && stream.status === "live" && (
            <button
              onClick={() => void finish()}
              disabled={ending}
              className="flex items-center gap-2 rounded-lg bg-destructive px-3 py-2 text-xs font-bold text-destructive-foreground disabled:opacity-60"
            >
              <Square size={14} /> Terminar transmisión
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border border-gold/40 bg-black">
          {stream.status !== "live" ? (
            <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
              Esta transmisión ya terminó.
            </div>
          ) : stream.mode === "camera" ? (
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isHost}
                className="h-full w-full object-cover"
              />
              {state !== "live" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center text-sm text-muted-foreground">
                  {state === "connecting"
                    ? "Conectando con la cámara del barbero…"
                    : "El barbero pausó la transmisión."}
                </div>
              )}
            </div>
          ) : embed ? (
            <iframe
              src={embed}
              title={stream.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center">
              <Radio size={26} className="text-gold" />
              <p className="text-sm text-muted-foreground">
                Este live se transmite en otra plataforma.
              </p>
              <a
                href={stream.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                <ExternalLink size={14} /> Ver el live
              </a>
            </div>
          )}
        </div>

        <LiveChat streamId={stream.id} canModerate={isHost || admin.canEdit} />
      </div>

      {isHost && stream.mode === "camera" && stream.status === "live" && (
        <p className="mt-4 rounded-xl border border-dashed border-gold/40 p-4 text-xs text-muted-foreground">
          Mantén esta pestaña abierta mientras transmites. Tus espectadores reciben el video directo
          desde tu cámara, sin costo de servidor.
        </p>
      )}
    </div>
  );
}
