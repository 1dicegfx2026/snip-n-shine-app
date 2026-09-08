import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  Radio,
  Users,
  Download,
} from "lucide-react";
import { useState } from "react";
import { SocialPills, SocialConnect } from "@/components/SocialConnect";
import { SponsorBanner } from "@/components/SponsorBanner";
import { usePros } from "@/lib/pro-store";
import { planOf, type ProPage } from "@/lib/data/pro-pages";
import { SEED_PRO_PAGES } from "@/lib/data/pro-pages";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/$handle")({
  head: ({ params }) => {
    const seed = SEED_PRO_PAGES.find((p) => p.handle === params.handle);
    const title = seed ? `${seed.name} — Página de barbero en GILT` : "Página de barbero — GILT";
    const description = seed
      ? `${seed.tagline} Mira sus trabajos por categoría, sus clases en vivo y reserva directo.`
      : "Página personal del profesional: trabajos por categoría, clases en vivo, redes y reservas.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!/^[a-z0-9-]+$/i.test(params.handle)) throw notFound();
    return { handle: params.handle };
  },
  component: ProPageView,
});

function ProPageView() {
  const { handle } = Route.useParams();
  const { getPage, hydrated } = usePros();
  const page = getPage(handle);
  const [cat, setCat] = useState("Todo");

  if (!page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          {hydrated ? "Esta página de barbero no existe" : "Cargando…"}
        </h1>
        {hydrated && (
          <Link to="/pros" className="mt-4 inline-block text-sm font-semibold text-gold">
            Ver todos los pros
          </Link>
        )}
      </div>
    );
  }

  const plan = planOf(page.plan);
  const cats = ["Todo", ...Array.from(new Set(page.work.map((w) => w.category)))];
  const work = cat === "Todo" ? page.work : page.work.filter((w) => w.category === cat);

  return (
    <div className="pb-16">
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <img src={page.bannerUrl} alt={`Portada de ${page.name}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

          <img
            src={page.avatarUrl}
            alt={page.name}
            className="h-28 w-28 rounded-2xl border-4 border-background object-cover"
            style={{ boxShadow: `0 0 0 2px ${page.accent}` }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold">{page.name}</h1>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: `${page.accent}22`, color: page.accent }}
              >
                <BadgeCheck size={13} /> {plan.name.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {page.shop} · {page.city}
            </p>
            <p className="mt-1 text-sm" style={{ color: page.accent }}>
              {page.tagline}
            </p>
          </div>
          <div className="flex gap-2">
            {page.barberSlug && (
              <Link
                to="/book/$slug"
                params={{ slug: page.barberSlug }}
                search={{ service: "", date: "", time: "" }}

                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
              >
                <CalendarDays size={16} /> Reservar
              </Link>
            )}
            <Link
              to="/pro/new"
              search={{ edit: page.handle }}
              className="inline-flex items-center rounded-xl border border-input px-4 py-3 text-sm font-semibold hover:bg-accent"
            >
              Editar
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <SocialPills socials={page.socials} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Sobre mí</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{page.bio}</p>
            </section>

            <SocialConnect socials={page.socials} />

            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">Mis trabajos</h2>
                <div className="flex flex-wrap gap-1.5">
                  {cats.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        c === cat
                          ? "bg-gold text-gold-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {work.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Todavía no hay trabajos en esta categoría.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {work.map((w) => (
                    <figure key={w.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      <img
                        src={w.imageUrl}
                        alt={w.title}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <figcaption className="p-3">
                        <p className="text-sm font-semibold">{w.title}</p>
                        <p className="text-xs text-muted-foreground">{w.category}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-lg font-bold">Clases en vivo</h2>
              {page.classes.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Aún no hay clases programadas.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {page.classes.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-gold">
                            <Radio size={13} /> {c.platform}
                          </p>
                          <p className="mt-1 font-display font-bold">{c.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {c.dateLabel} · {c.durationMin} min · {c.seats} cupos
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
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold tracking-[0.2em] text-gold">MEMBRESÍA</p>
              <p className="mt-2 font-display text-2xl font-extrabold">
                {plan.name} · ${plan.price}/mes
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Comisión GILT: {Math.round(plan.commission * 100)}% por corte reservado.
              </p>
              <Link
                to="/pricing"
                className="mt-3 inline-block text-sm font-semibold text-gold hover:underline"
              >
                Ver planes
              </Link>
            </div>

            {page.importedFrom.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gold">
                  <Download size={13} /> CLIENTES IMPORTADOS
                </p>
                <p className="mt-2 inline-flex items-center gap-2 font-display text-2xl font-extrabold">
                  <Users size={18} /> {page.clientsImported}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Desde {page.importedFrom.join(", ")}.
                </p>
              </div>
            )}

            {page.sponsors.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener sponsored"
                className="block overflow-hidden rounded-2xl border border-gold/40 bg-gold/5"
              >
                <img src={s.imageUrl} alt={s.brand} className="h-28 w-full object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-gold">SPONSOR</p>
                  <p className="mt-1 font-display font-bold">{s.brand}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </a>
            ))}

            <SponsorBanner />

            <Link
              to="/sponsors"
              className="block rounded-2xl border border-dashed border-border p-5 text-center text-sm font-semibold text-muted-foreground hover:text-gold"
            >
              ¿Quieres tu marca aquí? Espacio de sponsor disponible
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export type { ProPage };
