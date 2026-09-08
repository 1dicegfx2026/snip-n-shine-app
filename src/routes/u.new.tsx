import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useClients } from "@/lib/client-store";
import { CLIENT_CATEGORIES, type ClientProfile } from "@/lib/data/client-profiles";
import type { WorkItem } from "@/lib/data/pro-pages";
import { BARBERS } from "@/lib/data/barbers";
import heroImg from "@/assets/hero.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";

export const Route = createFileRoute("/u/new")({
  validateSearch: (s: Record<string, unknown>) => ({
    edit: typeof s["edit"] === "string" ? (s["edit"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Crea tu perfil de cliente — GILT" },
      {
        name: "description",
        content:
          "Arma tu página personal como cliente: tus looks por categoría, tus redes y tus barberos favoritos.",
      },
      { property: "og:title", content: "Crea tu perfil de cliente — GILT" },
      {
        property: "og:description",
        content: "Guarda tus looks, conecta tus redes y marca tus barberos favoritos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientBuilder,
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function ClientBuilder() {
  const { edit } = Route.useSearch();
  const { getProfile, saveProfile } = useClients();
  const navigate = useNavigate();
  const existing = edit ? getProfile(edit) : undefined;

  const [p, setP] = useState<ClientProfile>(
    existing ?? {
      handle: "",
      name: "",
      city: "",
      tagline: "",
      bio: "",
      avatarUrl: fadeShot,
      bannerUrl: heroImg,
      accent: "#d4af37",
      socials: { tiktok: "", instagram: "", youtube: "", facebook: "", website: "" },
      looks: [],
      favoriteStyles: [],
      favoriteBarbers: [],
      createdAt: Date.now(),
    },
  );

  const set = <K extends keyof ClientProfile>(k: K, v: ClientProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const addLook = () =>
    set("looks", [
      ...p.looks,
      { id: uid(), category: CLIENT_CATEGORIES[0]!, title: "", imageUrl: fadeShot } as WorkItem,
    ]);

  const updateLook = (id: string, patch: Partial<WorkItem>) =>
    set("looks", p.looks.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const save = () => {
    const handle = p.handle.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!handle || !p.name.trim()) {
      toast.error("Necesitas un nombre y un @usuario.");
      return;
    }
    saveProfile({ ...p, handle, createdAt: p.createdAt || Date.now() });
    toast.success("Perfil guardado.");
    navigate({ to: "/u/$handle", params: { handle } });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">MI PERFIL</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">
        {existing ? "Edita tu perfil" : "Crea tu página de cliente"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tus looks, tus redes y tus barberos favoritos en una sola página que puedes compartir.
      </p>

      <div className="mt-8 space-y-6">
        <Card title="Lo básico">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nombre" value={p.name} onChange={(v) => set("name", v)} placeholder="Tu nombre" />
            <Field label="@usuario" value={p.handle} onChange={(v) => set("handle", v)} placeholder="kiko" />
            <Field label="Ciudad" value={p.city} onChange={(v) => set("city", v)} placeholder="Bronx, New York" />
            <Field
              label="Frase"
              value={p.tagline}
              onChange={(v) => set("tagline", v)}
              placeholder="Fade cada 10 días"
            />
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted-foreground">Sobre mí</span>
            <textarea
              value={p.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Foto (URL)" value={p.avatarUrl} onChange={(v) => set("avatarUrl", v)} />
            <Field label="Portada (URL)" value={p.bannerUrl} onChange={(v) => set("bannerUrl", v)} />
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Color</span>
              <input
                type="color"
                value={p.accent}
                onChange={(e) => set("accent", e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background"
              />
            </label>
          </div>
        </Card>

        <Card title="Mis redes">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["tiktok", "instagram", "youtube", "facebook", "website"] as const).map((k) => (
              <Field
                key={k}
                label={k === "website" ? "Web" : k[0]!.toUpperCase() + k.slice(1)}
                value={p.socials[k]}
                onChange={(v) => set("socials", { ...p.socials, [k]: v })}
                placeholder={`https://${k === "website" ? "misitio.com" : k + ".com/@tuusuario"}`}
              />
            ))}
          </div>
        </Card>

        <Card title="Mis looks">
          {p.looks.map((l) => (
            <div key={l.id} className="mb-3 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Título" value={l.title} onChange={(v) => updateLook(l.id, { title: v })} />
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Categoría</span>
                <select
                  value={l.category}
                  onChange={(e) => updateLook(l.id, { category: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                >
                  {CLIENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => set("looks", p.looks.filter((x) => x.id !== l.id))}
                className="self-end rounded-lg border border-input p-2.5 text-muted-foreground hover:text-destructive"
                aria-label="Eliminar look"
              >
                <Trash2 size={16} />
              </button>
              <div className="sm:col-span-3">
                <Field label="Foto (URL)" value={l.imageUrl} onChange={(v) => updateLook(l.id, { imageUrl: v })} />
              </div>
            </div>
          ))}
          <button
            onClick={addLook}
            className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            <Plus size={15} /> Agregar look
          </button>
        </Card>

        <Card title="Barberos favoritos">
          <div className="flex flex-wrap gap-2">
            {BARBERS.map((b) => {
              const on = p.favoriteBarbers.includes(b.slug);
              return (
                <button
                  key={b.slug}
                  onClick={() =>
                    set(
                      "favoriteBarbers",
                      on ? p.favoriteBarbers.filter((s) => s !== b.slug) : [...p.favoriteBarbers, b.slug],
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    on ? "bg-gold text-gold-foreground" : "border border-border text-muted-foreground"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <Field
              label="Estilos que me gustan (separados por coma)"
              value={p.favoriteStyles.join(", ")}
              onChange={(v) =>
                set("favoriteStyles", v.split(",").map((s) => s.trim()).filter(Boolean))
              }
              placeholder="Mid fade, Line up, Barba"
            />
          </div>
        </Card>

        <button
          onClick={save}
          className="w-full rounded-xl bg-gold px-6 py-4 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          Guardar mi perfil
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
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
