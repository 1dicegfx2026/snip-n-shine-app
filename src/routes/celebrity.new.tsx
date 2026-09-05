import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Palette, Rocket } from "lucide-react";
import { CELEB_ROLES, slugify, type CelebProfile } from "@/lib/data/celebrities";
import { useSite } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/celebrity/new")({
  head: () => ({
    meta: [
      { title: "Crea tu perfil de artista — GILT Celebrity" },
      {
        name: "description",
        content:
          "Arma tu perfil de artista al estilo MySpace: tus colores, tu música, tu galería y tu agenda para que los fans hagan appointment directo contigo.",
      },
      { property: "og:title", content: "Crea tu perfil de artista — GILT Celebrity" },
      { property: "og:description", content: "Tu página, tus colores, tu agenda. Los fans reservan directo." },
    ],
  }),
  component: NewCelebPage,
});

const THEMES = [
  { bg: "#0b0b0c", accent: "#d9b24c", label: "Noir & oro" },
  { bg: "#07120d", accent: "#2fbf71", label: "Verde dinero" },
  { bg: "#120a14", accent: "#c084fc", label: "Neón morado" },
  { bg: "#0a0f1c", accent: "#38bdf8", label: "Azul hielo" },
  { bg: "#160909", accent: "#f97316", label: "Fuego" },
  { bg: "#0f0f0f", accent: "#e5e7eb", label: "Plata" },
];

function NewCelebPage() {
  const { saveCelebProfile } = useSite();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [role, setRole] = useState<string>(CELEB_ROLES[0]);
  const [city, setCity] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [mood, setMood] = useState("🔥");
  const [status, setStatus] = useState("Agenda abierta");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [gallery, setGallery] = useState("");
  const [tracks, setTracks] = useState("");
  const [services, setServices] = useState("Meet & greet | 250 | 15\nSesión privada | 900 | 60");
  const [theme, setTheme] = useState(THEMES[0]!);

  function publish() {
    if (!name.trim()) {
      toast.error("Ponle nombre a tu perfil.");
      return;
    }
    const parsedServices = services
      .split("\n")
      .map((line) => line.split("|").map((p) => p.trim()))
      .filter((p) => p[0])
      .map((p, i) => ({
        id: `s${i}`,
        name: p[0]!,
        price: Number(p[1] ?? 0) || 0,
        durationMin: Number(p[2] ?? 30) || 30,
        note: p[3] ?? "",
      }));

    const profile: CelebProfile = {
      slug: slugify(name),
      name: name.trim(),
      alias: alias.trim() || name.trim().toUpperCase(),
      role,
      city: city.trim() || "En línea",
      avatar: avatar.trim() || "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=800",
      banner: banner.trim() || avatar.trim() || "https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=1200",
      themeBg: theme.bg,
      themeAccent: theme.accent,
      mood: mood.trim(),
      status: status.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      verified: false,
      followers: 0,
      services: parsedServices.length
        ? parsedServices
        : [{ id: "s0", name: "Meet & greet", price: 100, durationMin: 15, note: "" }],
      gallery: gallery
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      tracks: tracks
        .split("\n")
        .map((t) => t.split("|").map((p) => p.trim()))
        .filter((p) => p[0])
        .map((p) => ({ title: p[0]!, vibe: p[1] ?? "", length: p[2] ?? "" })),
      topFriends: [],
      guestbook: [],
      custom: true,
    };

    saveCelebProfile(profile);
    toast.success("¡Perfil publicado!");
    navigate({ to: "/celebrity/$slug", params: { slug: profile.slug } });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">GILT CELEBRITY PRO</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Arma tu perfil</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Como los viejos tiempos: escoge tu tema, sube tus fotos, pon tu música y tu lista de
        servicios. Los fans hacen appointment directo contigo.
      </p>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Palette size={17} className="text-gold" /> Tu tema
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.label}
              onClick={() => setTheme(t)}
              className="flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold"
              style={{
                borderColor: theme.label === t.label ? t.accent : "var(--color-border)",
                background: t.bg,
              }}
            >
              <span className="h-6 w-6 rounded-full" style={{ background: t.accent }} />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <Field label="Nombre artístico" value={name} onChange={setName} placeholder="Plátano Gucci" />
        <Field label="Alias / lema corto" value={alias} onChange={setAlias} placeholder="EL PLÁTANO" />
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Qué eres</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
          >
            {CELEB_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <Field label="Ciudad" value={city} onChange={setCity} placeholder="Bronx, NY" />
        <Field label="Mood" value={mood} onChange={setMood} placeholder="🔥 en el estudio" />
        <Field label="Estado / disponibilidad" value={status} onChange={setStatus} placeholder="Agenda abierta" />
        <Field label="Frase de portada" value={tagline} onChange={setTagline} placeholder="Trenzas, cámara y bulla." />
        <Field label="Foto de perfil (URL)" value={avatar} onChange={setAvatar} placeholder="https://…" />
        <Field label="Banner (URL)" value={banner} onChange={setBanner} placeholder="https://…" />
        <Area label="Tu historia" value={bio} onChange={setBio} placeholder="Cuéntale a la gente quién eres…" />
        <Area
          label="Galería — una URL por línea"
          value={gallery}
          onChange={setGallery}
          placeholder={"https://…/foto1.jpg\nhttps://…/foto2.jpg"}
        />
        <Area
          label="Música — Título | Género | Duración"
          value={tracks}
          onChange={setTracks}
          placeholder={"Noche de Oro | Reggaetón | 3:12"}
        />
        <Area
          label="Servicios — Nombre | Precio | Minutos | Nota"
          value={services}
          onChange={setServices}
        />
      </section>

      <button
        onClick={publish}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
      >
        <Rocket size={16} /> Publicar mi perfil
      </button>
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

function Area({
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
    <label className="block sm:col-span-2">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}
