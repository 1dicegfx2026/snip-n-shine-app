import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Radio, Video, Link2, Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth";
import { usePros } from "@/lib/pro-store";
import { useLive, type LiveMode } from "@/lib/live-store";

export const Route = createFileRoute("/live/new")({
  head: () => ({
    meta: [
      { title: "Salir en vivo — GILT" },
      {
        name: "description",
        content:
          "Transmite en vivo desde tu cámara dentro de GILT o conecta tu live de YouTube, Twitch, TikTok o Instagram.",
      },
      { property: "og:title", content: "Salir en vivo — GILT" },
      { property: "og:description", content: "Abre tu cámara y transmite a tus clientes en GILT." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGate>
      <GoLivePage />
    </AuthGate>
  ),
});

function GoLivePage() {
  const { displayName } = useAuth();
  const { myPages } = usePros();
  const { startStream } = useLive();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<LiveMode>("camera");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [barberSlug, setBarberSlug] = useState(myPages[0]?.handle ?? "");
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!barberSlug && myPages[0]) setBarberSlug(myPages[0].handle);
  }, [myPages, barberSlug]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const openCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (videoRef.current) videoRef.current.srcObject = media;
      setCamOn(true);
    } catch {
      toast.error("No pudimos abrir la cámara. Da permiso en el navegador e intenta otra vez.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const go = async () => {
    if (!title.trim()) {
      toast.error("Ponle un título a tu transmisión.");
      return;
    }
    if (mode === "external" && !externalUrl.trim()) {
      toast.error("Pega el enlace de tu live.");
      return;
    }
    setBusy(true);
    try {
      const id = await startStream({
        title: title.trim(),
        description: description.trim(),
        mode,
        externalUrl: externalUrl.trim(),
        barberSlug,
        hostName: displayName || "Pro GILT",
      });
      closeCamera();
      toast.success("¡Estás en vivo!");
      void navigate({ to: "/live/$id", params: { id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar la transmisión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">TRANSMISIÓN</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Salir en vivo</h1>
      <p className="mt-2 text-muted-foreground">
        Transmite desde la cámara sin salir de GILT, o conecta el live que ya tienes en otra
        plataforma. El chat y el botón de reserva salen al lado del video.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {(
          [
            { id: "camera", label: "Cámara de GILT", icon: Camera, hint: "Se transmite desde este dispositivo" },
            { id: "external", label: "Enlace externo", icon: Link2, hint: "YouTube, Twitch, TikTok, IG, Facebook" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              mode === m.id ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"
            }`}
          >
            <m.icon size={18} className="text-gold" />
            <p className="mt-2 font-display text-sm font-bold">{m.label}</p>
            <p className="text-xs text-muted-foreground">{m.hint}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <label className="text-xs font-bold tracking-widest text-muted-foreground">TÍTULO</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fade con navaja paso a paso"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold tracking-widest text-muted-foreground">
            DESCRIPCIÓN
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Qué vas a mostrar hoy…"
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />
        </div>
        {myPages.length > 0 && (
          <div>
            <label className="text-xs font-bold tracking-widest text-muted-foreground">
              PERFIL QUE TRANSMITE
            </label>
            <select
              value={barberSlug}
              onChange={(e) => setBarberSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
            >
              {myPages.map((p) => (
                <option key={p.handle} value={p.handle}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "external" ? (
          <div>
            <label className="text-xs font-bold tracking-widest text-muted-foreground">
              ENLACE DEL LIVE
            </label>
            <input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              YouTube y Twitch se ven dentro de GILT. TikTok, Instagram y Facebook abren en pestaña
              nueva.
            </p>
          </div>
        ) : (
          <div>
            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-background">
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {camOn ? (
                <>
                  <button
                    onClick={closeCamera}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold"
                  >
                    <CameraOff size={14} /> Apagar cámara
                  </button>
                  <button
                    onClick={toggleMic}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold"
                  >
                    {micOn ? <Mic size={14} /> : <MicOff size={14} />} {micOn ? "Micrófono activo" : "Micrófono apagado"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => void openCamera()}
                  className="flex items-center gap-2 rounded-lg border border-gold px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
                >
                  <Video size={14} /> Probar cámara
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Al entrar en vivo la cámara se abre sola en la pantalla de transmisión. Mantén esa
              pestaña abierta mientras transmites.
            </p>
          </div>
        )}

        <button
          onClick={() => void go()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
        >
          <Radio size={16} /> {busy ? "Iniciando…" : "Entrar en vivo"}
        </button>
      </div>
    </div>
  );
}
