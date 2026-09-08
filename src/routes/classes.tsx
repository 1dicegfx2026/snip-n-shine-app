import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { usePros } from "@/lib/pro-store";
import { SponsorBanner } from "@/components/SponsorBanner";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Clases en vivo de barbería — GILT" },
      {
        name: "description",
        content:
          "Aprende fades, navaja, trenzas y color con clases en vivo dictadas por los mejores pros. Cupos limitados y pago por clase.",
      },
      { property: "og:title", content: "Clases en vivo de barbería — GILT" },
      {
        property: "og:description",
        content: "Clases online en vivo con barberos y estilistas top. Reserva tu cupo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const { pages } = usePros();
  const [platform, setPlatform] = useState("Todas");

  const all = pages.flatMap((p) => p.classes.map((c) => ({ ...c, pro: p })));
  const platforms = ["Todas", ...Array.from(new Set(all.map((c) => c.platform)))];
  const list = platform === "Todas" ? all : all.filter((c) => c.platform === platform);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">CLASES EN VIVO</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">
        Aprende del que <span className="text-gold-gradient">está cortando</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Clases online en vivo con cámara sobre la silla: fades, navaja, trenzas, color y cómo cobrar
        lo que vales. Pagas por clase y recibes el enlace.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {platforms.map((pf) => (
          <button
            key={pf}
            onClick={() => setPlatform(pf)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              pf === platform
                ? "bg-gold text-gold-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {pf}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <SponsorBanner />
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Todavía no hay clases programadas aquí.</p>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {list.map((c) => (
            <div key={`${c.pro.handle}-${c.id}`} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={c.pro.bannerUrl} alt="" loading="lazy" className="h-32 w-full object-cover" />
              <div className="p-5">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-gold">
                  <Radio size={13} /> {c.platform}
                </p>
                <p className="mt-1 font-display text-lg font-bold">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>

                <Link
                  to="/pro/$handle"
                  params={{ handle: c.pro.handle }}
                  className="mt-4 flex items-center gap-3 hover:text-gold"
                >
                  <img src={c.pro.avatarUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.pro.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{c.pro.city}</span>
                  </span>
                </Link>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="text-xs text-muted-foreground">
                    <p className="inline-flex items-center gap-1.5">
                      <Clock size={12} /> {c.dateLabel} · {c.durationMin} min
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5">
                      <Users size={12} /> {c.seats} cupos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-extrabold">${c.price}</p>
                    <button
                      onClick={() => toast.success("Cupo apartado (demo). Te enviamos el enlace por email.")}
                      className="mt-2 rounded-lg bg-gold px-4 py-2 text-xs font-bold text-gold-foreground hover:bg-gold/90"
                    >
                      Apartar cupo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-gold/30 bg-gradient-to-br from-emerald-deep via-card to-background p-8">
        <h2 className="font-display text-2xl font-bold">¿Eres pro y quieres dar clases?</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Con el plan Pro o Elite programas tus clases, pones tu precio y cobras por cada cupo.
        </p>
        <Link
          to="/pro/new"
          search={{ edit: "" }}
          className="mt-5 inline-block rounded-xl bg-gold px-6 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          Programar mi clase
        </Link>
      </div>
    </div>
  );
}
