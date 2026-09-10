import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, Users, Video, Play } from "lucide-react";
import { useLive } from "@/lib/live-store";
import { SponsorBanner } from "@/components/SponsorBanner";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "En vivo ahora — GILT" },
      {
        name: "description",
        content:
          "Mira barberos y estilistas transmitiendo en vivo desde la silla. Entra al chat, aprende y reserva tu cita al momento.",
      },
      { property: "og:title", content: "En vivo ahora — GILT" },
      {
        property: "og:description",
        content: "Transmisiones en vivo de los mejores barberos, con chat y reserva directa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveIndexPage,
});

const since = (t: number) => {
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
};

function LiveIndexPage() {
  const { live, streams, hydrated } = useLive();
  const past = streams.filter((s) => s.status === "ended").slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-gold">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-destructive" /> EN VIVO
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">
            La silla, <span className="text-gold-gradient">en directo</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Transmite desde tu cámara sin salir de GILT, o conecta tu live de YouTube, Twitch,
            TikTok o Instagram. Chat en vivo y botón de reserva mientras cortas.
          </p>
        </div>
        <Link
          to="/live/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
        >
          <Radio size={16} /> Salir en vivo
        </Link>
      </div>

      <div className="mt-8">
        {!hydrated && <p className="text-sm text-muted-foreground">Cargando transmisiones…</p>}
        {hydrated && live.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gold/40 p-10 text-center">
            <Video size={28} className="mx-auto text-gold" />
            <p className="mt-3 font-display text-lg font-bold">Nadie está en vivo ahora mismo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sé el primero: abre tu cámara y muestra el corte en tiempo real.
            </p>
            <Link
              to="/live/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10"
            >
              <Radio size={15} /> Empezar transmisión
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((s) => (
            <Link
              key={s.id}
              to="/live/$id"
              params={{ id: s.id }}
              className="group rounded-2xl border border-gold/40 bg-card p-5 transition-colors hover:border-gold"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-black tracking-widest text-destructive-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> LIVE
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} /> {s.viewers}
                </span>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold group-hover:text-gold">{s.title}</h2>
              <p className="mt-1 text-xs text-gold">{s.hostName || "Pro GILT"}</p>
              {s.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Play size={12} /> {since(s.startedAt)} en vivo ·{" "}
                {s.mode === "camera" ? "Cámara GILT" : "Transmisión externa"}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <SponsorBanner />
      </div>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Transmisiones pasadas</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {past.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.hostName || "Pro GILT"} · {new Date(s.startedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
