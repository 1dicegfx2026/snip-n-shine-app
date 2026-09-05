import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Film } from "lucide-react";
import { useSite } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Video destacado y anuncios | GILT" },
      {
        name: "description",
        content:
          "Panel de administración de GILT: sube videos de cortes, crea slides de publicidad y controla lo que ve el cliente al entrar.",
      },
      { property: "og:title", content: "Admin — Video destacado y anuncios | GILT" },
      { property: "og:description", content: "Sube videos de cortes y controla el slider de publicidad de GILT." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { slides, addSlide, updateSlide, removeSlide, requests, leads } = useSite();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">ADMINISTRACIÓN</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Video destacado & publicidad</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Todo lo que agregues aquí sale arriba en la portada, en un slider que cambia solo. Pega el
        enlace de tu video de un corte (mp4/webm) o una foto para el anuncio.
      </p>

      <section className="mt-8 rounded-xl border border-gold/30 bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Film size={17} className="text-gold" /> Nuevo slide
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Título" value={title} onChange={setTitle} placeholder="Fade en 20 minutos" />
          <Field label="Texto corto" value={subtitle} onChange={setSubtitle} placeholder="Grabado en The Gilded Chair" />
          <Field label="URL del video (mp4/webm)" value={videoUrl} onChange={setVideoUrl} placeholder="https://…/corte.mp4" />
          <Field label="URL de la imagen (si no hay video)" value={imageUrl} onChange={setImageUrl} placeholder="https://…/foto.jpg" />
          <Field label="Texto del botón" value={ctaLabel} onChange={setCtaLabel} placeholder="Reservar ahora" />
          <Field label="Enlace del botón" value={ctaUrl} onChange={setCtaUrl} placeholder="/explore" />
        </div>
        <button
          onClick={() => {
            if (!title.trim() || (!videoUrl.trim() && !imageUrl.trim())) {
              toast.error("Pon un título y al menos un video o una imagen.");
              return;
            }
            addSlide({
              title: title.trim(),
              subtitle: subtitle.trim(),
              videoUrl: videoUrl.trim(),
              imageUrl: imageUrl.trim(),
              ctaLabel: ctaLabel.trim(),
              ctaUrl: ctaUrl.trim(),
              active: true,
            });
            setTitle("");
            setSubtitle("");
            setVideoUrl("");
            setImageUrl("");
            setCtaLabel("");
            setCtaUrl("");
            toast.success("Slide publicado en la portada.");
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <Plus size={15} /> Publicar slide
        </button>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold">Slides en portada ({slides.length})</h2>
        <div className="mt-3 space-y-3">
          {slides.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {s.videoUrl ? (
                  <video src={s.videoUrl} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.videoUrl ? "Video" : "Imagen"} · {s.subtitle || "sin texto"}
                </p>
              </div>
              <button
                onClick={() => updateSlide(s.id, { active: !s.active })}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-gold"
                aria-label={s.active ? "Ocultar" : "Mostrar"}
              >
                {s.active ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                onClick={() => removeSlide(s.id)}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                aria-label="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-bold tracking-[0.2em] text-gold">SOLICITUDES A CELEBRITIES</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{requests.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-bold tracking-[0.2em] text-gold">AFILIADOS & SPONSORS</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{leads.length}</p>
        </div>
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
