import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Sparkles, UserPlus, CalendarClock, X } from "lucide-react";
import { CELEBRITIES, formatFollowers } from "@/lib/data/celebrities";
import { useSite } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/celebrities")({
  head: () => ({
    meta: [
      { title: "Artistas Celebrity — Reserva directo | GILT" },
      {
        name: "description",
        content:
          "Haz appointment directo con artistas y celebridades: meet & greets, sesiones de estudio, apariciones y cortes en cámara. Solo en GILT.",
      },
      { property: "og:title", content: "Artistas Celebrity — Reserva directo | GILT" },
      {
        property: "og:description",
        content: "Meet & greets, sesiones y apariciones con artistas celebrity, reservables al instante.",
      },
    ],
  }),
  component: CelebritiesPage,
});

function CelebritiesPage() {
  const { celebProfiles, requests, cancelRequest } = useSite();
  const all = [...CELEBRITIES, ...celebProfiles];
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">GILT CELEBRITY</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold">
            Reserva directo con tus <span className="text-gold-gradient">artistas</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Perfiles al estilo viejo internet: cada artista arma el suyo con sus colores, su música,
            su galería y su agenda. Tú escoges el servicio y mandas el appointment directo.
          </p>
        </div>
        <Link
          to="/celebrity/new"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-gold px-5 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <UserPlus size={16} /> Soy artista — crear mi perfil
        </Link>
      </div>

      {pending.length > 0 && (
        <section className="mt-8 rounded-xl border border-gold/30 bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <CalendarClock size={17} className="text-gold" /> Tus solicitudes
          </h2>
          <div className="mt-3 space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                <span>
                  <b>{r.celebName}</b> — {r.serviceName} · {r.dateISO} {r.time} · ${r.price}
                </span>
                <button
                  onClick={() => {
                    cancelRequest(r.id);
                    toast.success("Solicitud cancelada.");
                  }}
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((c) => (
          <Link
            key={c.slug}
            to="/celebrity/$slug"
            params={{ slug: c.slug }}
            className="card-luxe group overflow-hidden"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={c.avatar}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute inset-x-0 bottom-0 h-1"
                style={{ background: c.themeAccent }}
              />
            </div>
            <div className="p-5">
              <p className="flex items-center gap-1.5 font-display text-lg font-bold">
                {c.name}
                {c.verified && <BadgeCheck size={16} className="text-gold" />}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.role} · {c.city}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.tagline}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Sparkles size={13} className="text-gold" /> {formatFollowers(c.followers)} fans
                </span>
                <span className="font-display font-bold text-gold">
                  desde ${Math.min(...c.services.map((s) => s.price))}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
