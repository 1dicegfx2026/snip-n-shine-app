import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/data/pro-pages";
import { PAY_METHODS } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Membresías para barberos — GILT" },
      {
        name: "description",
        content:
          "Planes de $19, $49 y $99 al mes para barberos y estilistas: página personal, clases en vivo, sponsors y comisión desde 5% por corte.",
      },
      { property: "og:title", content: "Membresías para barberos — GILT" },
      {
        property: "og:description",
        content: "Página personal, clases en vivo, sponsors y comisión desde 5% por corte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [selected, setSelected] = useState("pro");
  const [pay, setPay] = useState(PAY_METHODS[0]!.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">MEMBRESÍAS</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">
        Cobra más, <span className="text-gold-gradient">trabaja mejor</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Membresía mensual + 10% de comisión por cada corte reservado (baja a 8% en Pro y 5% en
        Elite). Sin contratos: cancelas cuando quieras.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`rounded-2xl border p-6 text-left transition-colors ${
              selected === p.id ? "border-gold bg-gold/5" : "border-border bg-card hover:border-gold/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.2em] text-gold">{p.name.toUpperCase()}</p>
              {p.featured && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                  POPULAR
                </span>
              )}
            </div>
            <p className="mt-2 font-display text-4xl font-extrabold">
              ${p.price}
              <span className="text-base font-semibold text-muted-foreground">/mes</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {Math.round(p.commission * 100)}% de comisión por corte
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-gold" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Cómo quieres pagar</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPay(m.id)}
              className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                pay === m.id ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
              }`}
            >
              <p className="font-semibold">{m.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => toast.success("Membresía activada en modo demo. Ya puedes crear tu página.")}
          className="mt-5 rounded-xl bg-gold px-6 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          Activar membresía
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Modo demo: no se cobra nada todavía. Cuando quieras cobros reales lo conectamos.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/pro/new"
          search={{ edit: "" }}
          className="rounded-xl border border-input px-5 py-3 text-sm font-semibold hover:bg-accent"
        >
          Crear mi página de barbero
        </Link>
        <Link to="/sponsors" className="rounded-xl border border-input px-5 py-3 text-sm font-semibold hover:bg-accent">
          Ver paquetes de sponsors
        </Link>
      </div>
    </div>
  );
}
