import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Link2 } from "lucide-react";
import { usePros } from "@/lib/pro-store";
import { PLANS, type PlanId, type ProPage, type WorkItem, type LiveClass } from "@/lib/data/pro-pages";
import heroImg from "@/assets/hero.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";

export const Route = createFileRoute("/pro/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    edit: typeof s["edit"] === "string" ? (s["edit"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Crea tu página de barbero — GILT" },
      {
        name: "description",
        content:
          "Arma tu página web personal: bio, trabajos por categoría, redes sociales, clases en vivo, membresía e importación de clientes desde Booksy.",
      },
      { property: "og:title", content: "Crea tu página de barbero — GILT" },
      {
        property: "og:description",
        content: "Bio, portafolio por categoría, redes, clases en vivo y membresía en un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProBuilder,
});

const CATEGORIES = ["Cuts", "Fades", "Beard", "Braids", "Color", "Shave", "Nails", "Styling"];
const PLATFORMS = ["Booksy", "The Cut", "Square", "Fresha", "Instagram DMs"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ProBuilder() {
  const { edit } = Route.useSearch();
  const { getPage, savePage } = usePros();
  const navigate = useNavigate();
  const existing = edit ? getPage(edit) : undefined;

  const [p, setP] = useState<ProPage>(
    existing ?? {
      handle: "",
      name: "",
      shop: "",
      city: "",
      tagline: "",
      bio: "",
      avatarUrl: fadeShot,
      bannerUrl: heroImg,
      accent: "#d4af37",
      plan: "pro" as PlanId,
      barberSlug: "",
      socials: { tiktok: "", instagram: "", youtube: "", facebook: "", website: "" },
      work: [],
      classes: [],
      sponsors: [],
      importedFrom: [],
      clientsImported: 0,
      createdAt: Date.now(),
    },
  );

  const set = (patch: Partial<ProPage>) => setP((prev) => ({ ...prev, ...patch }));

  const addWork = () =>
    set({
      work: [...p.work, { id: uid(), category: "Fades", title: "", imageUrl: "" } as WorkItem],
    });
  const addClass = () =>
    set({
      classes: [
        ...p.classes,
        {
          id: uid(),
          title: "",
          dateLabel: "",
          durationMin: 60,
          price: 30,
          platform: "GILT Live",
          seats: 30,
          description: "",
        } as LiveClass,
      ],
    });

  const publish = async () => {
    const handle = (p.handle || p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!p.name.trim() || !handle) {
      toast.error("Pon al menos tu nombre.");
      return;
    }
    try {
      await savePage({ ...p, handle });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos guardar.");
      return;
    }
    toast.success("¡Tu página está publicada!");
    navigate({ to: "/pro/$handle", params: { handle } });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">PRO</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">
        {existing ? "Edita tu página" : "Crea tu página"} <span className="text-gold-gradient">web</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tu perfil funciona como tu propia página: bio, trabajos por categoría, redes, clases en vivo y
        reservas.
      </p>

      <Section title="Lo básico">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre" value={p.name} onChange={(v) => set({ name: v })} placeholder="Marcus Cole" />
          <Field
            label="Usuario / enlace"
            value={p.handle}
            onChange={(v) => set({ handle: v })}
            placeholder="marcus (gilt.app/pro/marcus)"
          />
          <Field label="Barbería" value={p.shop} onChange={(v) => set({ shop: v })} placeholder="The Gilded Chair" />
          <Field label="Ciudad" value={p.city} onChange={(v) => set({ city: v })} placeholder="Bronx, NY" />
          <Field label="Frase corta" value={p.tagline} onChange={(v) => set({ tagline: v })} placeholder="Fades que brillan" />
          <Field
            label="Ficha de reservas (slug)"
            value={p.barberSlug}
            onChange={(v) => set({ barberSlug: v })}
            placeholder="marcus-cole"
          />
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-muted-foreground">Sobre ti</span>
          <textarea
            value={p.bio}
            onChange={(e) => set({ bio: e.target.value })}
            rows={4}
            placeholder="Cuenta tu historia, tu estilo y a quién cortas."
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Foto de perfil (URL)" value={p.avatarUrl} onChange={(v) => set({ avatarUrl: v })} />
          <Field label="Portada (URL)" value={p.bannerUrl} onChange={(v) => set({ bannerUrl: v })} />
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Color de tu marca</span>
            <input
              type="color"
              value={p.accent}
              onChange={(e) => set({ accent: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background"
            />
          </label>
        </div>
      </Section>

      <Section title="Tus redes">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="TikTok" value={p.socials.tiktok} onChange={(v) => set({ socials: { ...p.socials, tiktok: v } })} placeholder="https://tiktok.com/@tu" />
          <Field label="Instagram" value={p.socials.instagram} onChange={(v) => set({ socials: { ...p.socials, instagram: v } })} placeholder="https://instagram.com/tu" />
          <Field label="YouTube" value={p.socials.youtube} onChange={(v) => set({ socials: { ...p.socials, youtube: v } })} placeholder="https://youtube.com/@tu" />
          <Field label="Facebook" value={p.socials.facebook} onChange={(v) => set({ socials: { ...p.socials, facebook: v } })} placeholder="https://facebook.com/tu" />
          <Field label="Sitio web" value={p.socials.website} onChange={(v) => set({ socials: { ...p.socials, website: v } })} placeholder="https://tusitio.com" />
        </div>
      </Section>

      <Section title="Tus trabajos por categoría">
        {p.work.map((w, i) => (
          <div key={w.id} className="mb-3 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[140px_1fr_1fr_40px]">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Categoría</span>
              <select
                value={w.category}
                onChange={(e) => {
                  const next = [...p.work];
                  next[i] = { ...w, category: e.target.value };
                  set({ work: next });
                }}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Título"
              value={w.title}
              onChange={(v) => {
                const next = [...p.work];
                next[i] = { ...w, title: v };
                set({ work: next });
              }}
            />
            <Field
              label="Foto (URL)"
              value={w.imageUrl}
              onChange={(v) => {
                const next = [...p.work];
                next[i] = { ...w, imageUrl: v };
                set({ work: next });
              }}
            />
            <button
              onClick={() => set({ work: p.work.filter((x) => x.id !== w.id) })}
              className="mt-6 flex h-10 items-center justify-center rounded-lg border border-input text-muted-foreground hover:text-destructive"
              aria-label="Borrar trabajo"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <AddButton onClick={addWork} label="Añadir trabajo" />
      </Section>

      <Section title="Clases en vivo">
        {p.classes.map((c, i) => {
          const upd = (patch: Partial<LiveClass>) => {
            const next = [...p.classes];
            next[i] = { ...c, ...patch };
            set({ classes: next });
          };
          return (
            <div key={c.id} className="mb-3 rounded-xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Título" value={c.title} onChange={(v) => upd({ title: v })} placeholder="Masterclass del fade" />
                <Field label="Cuándo" value={c.dateLabel} onChange={(v) => upd({ dateLabel: v })} placeholder="Jueves 8:00 PM ET" />
                <Field label="Plataforma" value={c.platform} onChange={(v) => upd({ platform: v })} placeholder="GILT Live / IG Live" />
                <Field label="Precio ($)" value={String(c.price)} onChange={(v) => upd({ price: Number(v) || 0 })} />
                <Field label="Duración (min)" value={String(c.durationMin)} onChange={(v) => upd({ durationMin: Number(v) || 0 })} />
                <Field label="Cupos" value={String(c.seats)} onChange={(v) => upd({ seats: Number(v) || 0 })} />
              </div>
              <Field label="Descripción" value={c.description} onChange={(v) => upd({ description: v })} />
              <button
                onClick={() => set({ classes: p.classes.filter((x) => x.id !== c.id) })}
                className="mt-3 text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                Borrar clase
              </button>
            </div>
          );
        })}
        <AddButton onClick={addClass} label="Añadir clase en vivo" />
      </Section>

      <Section title="Trae tus clientes de otra app">
        <p className="text-sm text-muted-foreground">
          Marca de dónde vienes y cuántos clientes traes. Te armamos la lista para invitarlos a GILT.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((plat) => {
            const on = p.importedFrom.includes(plat);
            return (
              <button
                key={plat}
                onClick={() =>
                  set({
                    importedFrom: on
                      ? p.importedFrom.filter((x) => x !== plat)
                      : [...p.importedFrom, plat],
                  })
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  on ? "bg-gold text-gold-foreground" : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 size={13} /> {plat}
              </button>
            );
          })}
        </div>
        <div className="mt-3 max-w-xs">
          <Field
            label="Clientes a importar"
            value={String(p.clientsImported)}
            onChange={(v) => set({ clientsImported: Number(v) || 0 })}
          />
        </div>
      </Section>

      <Section title="Tu membresía">
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => set({ plan: plan.id })}
              className={`rounded-xl border p-4 text-left transition-colors ${
                p.plan === plan.id ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
              }`}
            >
              <p className="text-xs font-bold tracking-[0.2em] text-gold">{plan.name.toUpperCase()}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">${plan.price}/mes</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(plan.commission * 100)}% de comisión
              </p>
            </button>
          ))}
        </div>
      </Section>

      <button
        onClick={publish}
        className="mt-8 w-full rounded-xl bg-gold px-6 py-4 font-display text-base font-bold text-gold-foreground hover:bg-gold/90 sm:w-auto sm:px-10"
      >
        {existing ? "Guardar cambios" : "Publicar mi página"}
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Modo demo: tu página se guarda en este navegador. Cuando quieras cuentas reales lo conectamos.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 font-display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-gold hover:text-gold"
    >
      <Plus size={15} /> {label}
    </button>
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
