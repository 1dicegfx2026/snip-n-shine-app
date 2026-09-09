import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Film } from "lucide-react";
import { useSite } from "@/lib/site-store";
import { useBookings } from "@/lib/booking-store";
import { usePros } from "@/lib/pro-store";
import { useClients } from "@/lib/client-store";
import { Link } from "@tanstack/react-router";
import { useAdmin } from "@/lib/admin";
import { useAuth } from "@/lib/auth";
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
  const { slides, addSlide, updateSlide, removeSlide, requests, leads, sponsors, saveSponsor, removeSponsor } =
    useSite();
  const { bookings } = useBookings();
  const { pages } = usePros();
  const { profiles } = useClients();
  const [sp, setSp] = useState({ brand: "", tagline: "", offer: "", url: "", imageUrl: "" });
  const { user } = useAuth();
  const admin = useAdmin();
  const money = (v: number) => `$${v.toFixed(2)}`;
  const paid = bookings.reduce((a, b) => a + b.amountPaid - b.refunded, 0);
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



      {!admin.loading && !admin.isAdmin && (
        <section className="mt-8 rounded-xl border border-gold/40 bg-card p-5">
          <h2 className="font-display text-lg font-bold">Acceso de administrador</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {user
              ? "Esta cuenta todavía no es administradora. Si eres el dueño y nadie ha reclamado el acceso, tómalo aquí."
              : "Entra con tu cuenta para reclamar el acceso de administrador."}
          </p>
          {user ? (
            <button
              onClick={async () => {
                const ok = await admin.claimAdmin();
                toast[ok ? "success" : "error"](
                  ok ? "Ya eres administrador." : "Ya hay un administrador. Pídele que te dé acceso.",
                );
              }}
              className="mt-4 rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
            >
              Reclamar administrador
            </button>
          ) : (
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
            >
              Entrar
            </Link>
          )}
        </section>
      )}

      {admin.isAdmin && (
        <section className="mt-8 rounded-xl border border-gold/30 bg-card p-5">
          <h2 className="font-display text-lg font-bold">Usuarios y accesos gratis ({admin.users.length})</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dale acceso gratis a quien quieras, cámbiale el plan o hazlo administrador.
          </p>
          <div className="mt-4 space-y-2">
            {admin.users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.freeAccess ? "Acceso gratis" : "Paga normal"} · plan {u.plan}
                    {u.isAdmin ? " · admin" : ""}
                  </p>
                </div>
                <select
                  value={u.plan}
                  onChange={(e) => void admin.setPlan(u.id, e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter $19</option>
                  <option value="pro">Pro $49</option>
                  <option value="elite">Elite $99</option>
                </select>
                <button
                  onClick={() => void admin.setFreeAccess(u.id, !u.freeAccess)}
                  className={`rounded-lg border border-border px-3 py-1.5 text-xs font-bold ${u.freeAccess ? "text-gold" : "text-muted-foreground"}`}
                >
                  Gratis
                </button>
                <button
                  onClick={() => void admin.setAdmin(u.id, !u.isAdmin)}
                  className={`rounded-lg border border-border px-3 py-1.5 text-xs font-bold ${u.isAdmin ? "text-gold" : "text-muted-foreground"}`}
                >
                  Admin
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-4 sm:grid-cols-4">
        <Stat label="CITAS" value={String(bookings.length)} />
        <Stat label="BARBEROS" value={String(pages.length)} />
        <Stat label="CLIENTES" value={String(profiles.length)} />
        <Stat label="COBRADO" value={money(paid)} />
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Todas las citas ({bookings.length})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Barbero</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Pagado</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border/60">
                  <td className="py-2 pr-4">{b.name}</td>
                  <td className="py-2 pr-4">{b.barberSlug}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {b.dateISO} · {b.time}
                  </td>
                  <td className="py-2 pr-4">{money(b.amountPaid - b.refunded)}</td>
                  <td className="py-2 pr-4">{money(b.total)}</td>
                  <td className="py-2 capitalize">{b.status}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-muted-foreground">
                    Todavía no hay citas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Barberos ({pages.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pages.map((pg) => (
              <li key={pg.handle} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {pg.name} · <span className="text-muted-foreground">{pg.city}</span>
                </span>
                <Link to="/pro/$handle" params={{ handle: pg.handle }} className="shrink-0 text-xs font-bold text-gold">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Clientes ({profiles.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {profiles.map((c) => (
              <li key={c.handle} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {c.name} · <span className="text-muted-foreground">{c.city}</span>
                </span>
                <Link to="/u/$handle" params={{ handle: c.handle }} className="shrink-0 text-xs font-bold text-gold">
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-gold/30 bg-card p-5">
        <h2 className="font-display text-lg font-bold">Sponsors ({sponsors.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Marca" value={sp.brand} onChange={(v) => setSp({ ...sp, brand: v })} placeholder="Sharp47" />
          <Field label="Frase" value={sp.tagline} onChange={(v) => setSp({ ...sp, tagline: v })} placeholder="Clippers profesionales" />
          <Field label="Oferta" value={sp.offer} onChange={(v) => setSp({ ...sp, offer: v })} placeholder="20% off con GILT20" />
          <Field label="Enlace" value={sp.url} onChange={(v) => setSp({ ...sp, url: v })} placeholder="https://…" />
          <Field label="URL de la imagen" value={sp.imageUrl} onChange={(v) => setSp({ ...sp, imageUrl: v })} placeholder="https://…/banner.jpg" />
        </div>
        <button
          onClick={() => {
            if (!sp.brand.trim() || !sp.url.trim()) {
              toast.error("Pon al menos la marca y el enlace.");
              return;
            }
            saveSponsor({
              id: sp.brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              brand: sp.brand.trim(),
              tagline: sp.tagline.trim(),
              offer: sp.offer.trim(),
              url: sp.url.trim(),
              imageUrl: sp.imageUrl.trim(),
            });
            setSp({ brand: "", tagline: "", offer: "", url: "", imageUrl: "" });
            toast.success("Sponsor guardado.");
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <Plus size={15} /> Guardar sponsor
        </button>
        <div className="mt-4 space-y-2">
          {sponsors.map((s2) => (
            <div key={s2.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{s2.brand}</p>
                <p className="truncate text-xs text-muted-foreground">{s2.offer || s2.tagline}</p>
              </div>
              <button
                onClick={() => saveSponsor({ ...s2, featured: !s2.featured })}
                className={`rounded-lg border border-border px-3 py-1.5 text-xs font-bold ${s2.featured ? "text-gold" : "text-muted-foreground"}`}
              >
                Destacado
              </button>
              <button
                onClick={() => removeSponsor(s2.id)}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                aria-label="Eliminar sponsor"
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-bold tracking-[0.2em] text-gold">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold">{value}</p>
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
