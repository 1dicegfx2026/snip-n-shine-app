import { createFileRoute, Link } from "@tanstack/react-router";
import { usePros } from "@/lib/pro-store";
import { planOf } from "@/lib/data/pro-pages";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/pros")({
  head: () => ({
    meta: [
      { title: "Páginas de barberos — GILT" },
      {
        name: "description",
        content:
          "Cada profesional con su propia página web: trabajos por categoría, redes, clases en vivo y reservas directas.",
      },
      { property: "og:title", content: "Páginas de barberos — GILT" },
      {
        property: "og:description",
        content: "Perfiles personales de barberos y estilistas con portafolio, clases en vivo y reservas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProsPage,
});

function ProsPage() {
  const { pages } = usePros();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">PROS</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">
            Tu página, <span className="text-gold-gradient">tu marca</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Cada barbero y estilista tiene aquí su propia página web: trabajos por categoría, redes
            conectadas, clases en vivo y reservas directas.
          </p>
        </div>
        <Link
          to="/pro/new"
          search={{ edit: "" }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <Plus size={16} /> Crear mi página
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => {
          const plan = planOf(p.plan);
          return (
            <Link
              key={p.handle}
              to="/pro/$handle"
              params={{ handle: p.handle }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-gold/50"
            >
              <img
                src={p.bannerUrl}
                alt={p.name}
                loading="lazy"
                className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-gold">{plan.name}</span>
                  <span className="text-muted-foreground">
                    {p.work.length} trabajos · {p.classes.length} clases
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
