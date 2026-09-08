import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useClients } from "@/lib/client-store";
import { SponsorStrip } from "@/components/SponsorBanner";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Comunidad de clientes — GILT" },
      {
        name: "description",
        content:
          "Cada cliente con su propia página: sus looks por categoría, sus redes y sus barberos favoritos.",
      },
      { property: "og:title", content: "Comunidad de clientes — GILT" },
      {
        property: "og:description",
        content: "Perfiles personales de clientes con galería de looks, redes y barberos favoritos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { profiles } = useClients();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">COMUNIDAD</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">
            Los clientes también tienen <span className="text-gold-gradient">su página</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Guarda tus looks por categoría, conecta tus redes y enséñale al barbero exactamente lo
            que quieres antes de sentarte en la silla.
          </p>
        </div>
        <Link
          to="/u/new"
          search={{ edit: "" }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <Plus size={16} /> Crear mi perfil
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <Link
            key={p.handle}
            to="/u/$handle"
            params={{ handle: p.handle }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-gold/50"
          >
            <img
              src={p.bannerUrl}
              alt={p.name}
              loading="lazy"
              className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="p-5">
              <div className="flex items-center gap-3">
                <img src={p.avatarUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-display font-bold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.city}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
              <p className="mt-3 text-xs text-muted-foreground">{p.looks.length} looks guardados</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <p className="mb-3 text-xs font-bold tracking-[0.25em] text-muted-foreground">
          MARCAS QUE APOYAN
        </p>
        <SponsorStrip />
      </div>
    </div>
  );
}
