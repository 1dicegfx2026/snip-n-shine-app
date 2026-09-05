import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Link2, DollarSign, Share2, TrendingUp } from "lucide-react";
import { useSite } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/affiliates")({
  head: () => ({
    meta: [
      { title: "Programa de Afiliados — Gana con cada booking | GILT" },
      {
        name: "description",
        content:
          "Comparte tu enlace de GILT y gana comisión por cada cita reservada. Pagos por Zelle, Cash App, PayPal o transferencia.",
      },
      { property: "og:title", content: "Programa de Afiliados — GILT" },
      { property: "og:description", content: "Gana comisión por cada cita reservada con tu enlace." },
    ],
  }),
  component: AffiliatesPage,
});

const TIERS = [
  { name: "Starter", commission: "10%", detail: "Tus primeras 25 citas referidas." },
  { name: "Pro", commission: "15%", detail: "De 26 a 100 citas al mes." },
  { name: "Elite", commission: "20% + bonos", detail: "Más de 100 citas y contenido con la marca." },
];

function AffiliatesPage() {
  const { addLead } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">AFILIADOS</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">
        Comparte GILT y <span className="text-gold-gradient">cobra</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Barberos, creadores de contenido y promotores: cada persona que reserve con tu enlace te
        deja comisión. Se paga semanal por Zelle, Cash App, PayPal o transferencia.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Share2, title: "Comparte tu enlace", text: "Te damos un link y un código único para tus redes." },
          { icon: DollarSign, title: "Gana por cada cita", text: "Comisión sobre cada booking pagado, sin límite." },
          { icon: TrendingUp, title: "Sube de nivel", text: "Mientras más refieres, mejor tu porcentaje." },
        ].map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-5">
            <s.icon size={20} className="text-gold" />
            <p className="mt-3 font-display font-bold">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className="rounded-xl border border-gold/30 bg-card p-5">
            <p className="text-xs font-bold tracking-[0.2em] text-gold">{t.name.toUpperCase()}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{t.commission}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Link2 size={18} className="text-gold" /> Solicita tu enlace
        </h2>
        {done ? (
          <p className="mt-3 text-sm text-muted-foreground">
            ¡Listo! Recibimos tu solicitud. Te enviamos tu enlace y tu código al correo.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" />
              <Field label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" />
              <Field
                label="¿Dónde vas a promover?"
                value={detail}
                onChange={setDetail}
                placeholder="Instagram @tuusuario, 40k seguidores"
              />
            </div>
            <button
              onClick={() => {
                if (!name.trim() || !email.trim()) {
                  toast.error("Pon tu nombre y tu email.");
                  return;
                }
                addLead({ kind: "affiliate", name: name.trim(), email: email.trim(), detail: detail.trim() });
                setDone(true);
                toast.success("Solicitud de afiliado enviada.");
              }}
              className="mt-4 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
            >
              Quiero ser afiliado
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
