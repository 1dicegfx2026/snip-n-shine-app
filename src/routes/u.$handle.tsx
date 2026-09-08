import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Scissors } from "lucide-react";
import { useClients } from "@/lib/client-store";
import { SEED_CLIENT_PROFILES } from "@/lib/data/client-profiles";
import { SocialConnect } from "@/components/SocialConnect";
import { SponsorBanner } from "@/components/SponsorBanner";
import { BARBERS } from "@/lib/data/barbers";

export const Route = createFileRoute("/u/$handle")({
  head: ({ params }) => {
    const seed = SEED_CLIENT_PROFILES.find((p) => p.handle === params.handle);
    const title = seed ? `${seed.name} — Perfil de cliente en GILT` : "Perfil de cliente — GILT";
    const description = seed
      ? `${seed.tagline} Mira sus looks por categoría y sus barberos favoritos.`
      : "Página personal del cliente: looks por categoría, redes y barberos favoritos.";
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
  component: ClientProfileView,
});

function ClientProfileView() {
  const { handle } = Route.useParams();
  const { getProfile, hydrated } = useClients();
  const profile = getProfile(handle);
  const [cat, setCat] = useState("Todo");

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">
          {hydrated ? "Este perfil no existe" : "Cargando…"}
        </h1>
        {hydrated && (
          <Link to="/community" className="mt-4 inline-block text-sm font-semibold text-gold">
            Ver la comunidad
          </Link>
        )}
      </div>
    );
  }

  const cats = ["Todo", ...Array.from(new Set(profile.looks.map((l) => l.category)))];
  const looks = cat === "Todo" ? profile.looks : profile.looks.filter((l) => l.category === cat);
  const favorites = BARBERS.filter((b) => profile.favoriteBarbers.includes(b.slug));

  return (
    <div className="pb-16">
      <div className="relative h-48 w-full overflow-hidden sm:h-64">
        <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-24 w-24 rounded-2xl border-4 border-background object-cover"
            style={{ boxShadow: `0 0 0 2px ${profile.accent}` }}
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-extrabold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.city}</p>
            <p className="mt-1 text-sm" style={{ color: profile.accent }}>
              {profile.tagline}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/explore"
              search={{ q: "" }}
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
            >
              <Scissors size={16} /> Reservar un corte
            </Link>
            <Link
              to="/u/new"
              search={{ edit: profile.handle }}
              className="inline-flex items-center rounded-xl border border-input px-4 py-3 text-sm font-semibold hover:bg-accent"
            >
              Editar
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">Sobre mí</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              {profile.favoriteStyles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.favoriteStyles.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold">Mis looks</h2>
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
              {looks.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Todavía no hay looks aquí.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {looks.map((l) => (
                    <figure key={l.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <figcaption className="p-3">
                        <p className="text-sm font-semibold">{l.title}</p>
                        <p className="text-xs text-muted-foreground">{l.category}</p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>

            <SocialConnect socials={profile.socials} title="Mis redes" />
          </div>

          <aside className="space-y-4">
            {favorites.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-gold">
                  <Heart size={13} /> BARBEROS FAVORITOS
                </p>
                <div className="mt-3 space-y-3">
                  {favorites.map((b) => (
                    <Link
                      key={b.slug}
                      to="/barber/$slug"
                      params={{ slug: b.slug }}
                      className="flex items-center gap-3 hover:text-gold"
                    >
                      <img src={b.avatar} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{b.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{b.shop}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <SponsorBanner />

            <Link
              to="/classes"
              className="block rounded-2xl border border-dashed border-border p-5 text-center text-sm font-semibold text-muted-foreground hover:text-gold"
            >
              ¿Quieres aprender? Mira las clases en vivo
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
