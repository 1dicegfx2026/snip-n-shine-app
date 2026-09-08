import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Megaphone, Handshake } from "lucide-react";
import { useSite } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors & Marcas — Patrocina GILT" },
      {
        name: "description",
        content:
          "Paquetes de patrocinio en GILT: video en portada, marca en los perfiles celebrity y presencia en cada booking.",
      },
      { property: "og:title", content: "Sponsors & Marcas — Patrocina GILT" },
      { property: "og:description", content: "Pon tu marca frente a miles de clientes de barbería cada semana." },
    ],
  }),
  component: SponsorsPage,
});

const PACKAGES = [
  {
    name: "Bronce",
    price: "$250/mes",
    perks: ["Logo en la página de sponsors", "Mención mensual en redes", "Código de descuento para clientes"],
  },
  {
    name: "Oro",
    price: "$900/mes",
    perks: ["Slide de video en la portada", "Logo en los perfiles celebrity", "Reporte de clics y bookings"],
    featured: true,
  },
  {
    name: "Platino",
    price: "A la medida",
    perks: ["Patrocinio de eventos y apariciones", "Contenido con artistas celebrity", "Presencia en el checkout"],
  },
];

function SponsorsPage() {
  const { addLead } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">SPONSORS</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">
        Marcas que apoyan <span className="text-gold-gradient">la cultura</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Productos de grooming, ropa, bebidas, música — pon tu marca donde la gente reserva su corte
        y sigue a sus artistas favoritos.
      </p>

      <a
        href="https://www.sharp47.com/products/sharp-47-clipper-and-trimmers"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 to-transparent p-5 transition-colors hover:border-gold/60"
      >
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-gold">SPONSOR DESTACADO</p>
          <p className="mt-1 font-display text-xl font-bold">Sharp47</p>
          <p className="text-sm text-muted-foreground">Clipper & trimmers diseñados para el trabajo profesional.</p>
        </div>
        <span className="shrink-0 rounded-xl bg-gold px-4 py-2 font-display text-xs font-bold text-gold-foreground">
          Ver productos
        </span>
      </a>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Megaphone, title: "Video en portada", text: "Tu anuncio en el slider que ve todo el mundo al entrar." },
          { icon: Crown, title: "Con los celebrity", text: "Tu marca junto a los artistas y sus apariciones." },
          { icon: Handshake, title: "Alianzas reales", text: "Eventos, giveaways y contenido con las barberías top." },
        ].map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-5">
            <s.icon size={20} className="text-gold" />
            <p className="mt-3 font-display font-bold">{s.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {PACKAGES.map((p) => (
          <div
            key={p.name}
            className={`rounded-xl border p-5 ${p.featured ? "border-gold bg-gold/5" : "border-border bg-card"}`}
          >
            <p className="text-xs font-bold tracking-[0.2em] text-gold">{p.name.toUpperCase()}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{p.price}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {p.perks.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Hablemos de patrocinio</h2>
        {done ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Gracias — el equipo de GILT te contacta con el media kit y los números.
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Marca / empresa" value={name} onChange={setName} placeholder="Tu marca" />
              <Field label="Email de contacto" value={email} onChange={setEmail} placeholder="marca@email.com" />
              <Field label="Qué te interesa" value={detail} onChange={setDetail} placeholder="Paquete Oro, 3 meses" />
            </div>
            <button
              onClick={() => {
                if (!name.trim() || !email.trim()) {
                  toast.error("Pon el nombre de la marca y un email.");
                  return;
                }
                addLead({ kind: "sponsor", name: name.trim(), email: email.trim(), detail: detail.trim() });
                setDone(true);
                toast.success("Solicitud de patrocinio enviada.");
              }}
              className="mt-4 rounded-xl bg-gold px-6 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
            >
              Quiero patrocinar
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
