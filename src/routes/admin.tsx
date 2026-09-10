import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Film, Save, X } from "lucide-react";
import { useSite } from "@/lib/site-store";
import { useBookings, type BookingStatus } from "@/lib/booking-store";
import { usePros } from "@/lib/pro-store";
import { useClients } from "@/lib/client-store";
import { useAdmin, ROLE_ES, STAFF_ROLES, type StaffRole } from "@/lib/admin";
import { usePlatformSettings } from "@/lib/platform-settings";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de control — Admin GILT" },
      {
        name: "description",
        content:
          "Panel de administración de GILT: edita citas, devoluciones, barberos, clientes, usuarios, sponsors y anuncios desde un solo lugar.",
      },
      { property: "og:title", content: "Panel de control — Admin GILT" },
      {
        property: "og:description",
        content: "Controla citas, pagos, perfiles, sponsors y publicidad de GILT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "citas", label: "Citas", adminOnly: false },
  { id: "barberos", label: "Barberos", adminOnly: false },
  { id: "clientes", label: "Clientes", adminOnly: false },
  { id: "usuarios", label: "Usuarios", adminOnly: true },
  { id: "sponsors", label: "Sponsors", adminOnly: false },
  { id: "anuncios", label: "Anuncios", adminOnly: false },
  { id: "solicitudes", label: "Solicitudes", adminOnly: false },
  { id: "ajustes", label: "Ajustes", adminOnly: true },
] as const;

type TabId = (typeof TABS)[number]["id"];

const STATUSES: BookingStatus[] = ["upcoming", "arrived", "completed", "cancelled", "refunded"];
const STATUS_ES: Record<BookingStatus, string> = {
  upcoming: "Próxima",
  arrived: "Llegó",
  completed: "Completada",
  cancelled: "Cancelada",
  refunded: "Devuelta",
};

const money = (v: number) => `$${v.toFixed(2)}`;

function AdminPage() {
  const { user } = useAuth();
  const admin = useAdmin();
  const [tab, setTab] = useState<TabId>("citas");

  if (!user) {
    return (
      <Gate
        title="Panel de control"
        text="Entra con tu cuenta para abrir el panel de administración."
        action={<LinkBtn to="/auth">Entrar</LinkBtn>}
      />
    );
  }

  if (admin.loading) {
    return <Gate title="Panel de control" text="Cargando tu acceso…" />;
  }

  if (!admin.isStaff) {
    return (
      <Gate
        title="Panel de control"
        text="Esta cuenta todavía no es del equipo. Si eres el dueño y nadie ha reclamado el acceso, tómalo aquí."
        action={
          <button
            onClick={async () => {
              const ok = await admin.claimAdmin();
              toast[ok ? "success" : "error"](
                ok ? "Ya eres administrador." : "Ya hay un administrador. Pídele que te dé acceso.",
              );
            }}
            className="rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
          >
            Reclamar administrador
          </button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">ADMINISTRACIÓN</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Panel de control</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Desde aquí editas, cancelas, devuelves y borras cualquier cosa: citas, pagos, barberos,
        clientes, usuarios, sponsors, publicidad, comisiones y el equipo.
      </p>
      <p className="mt-2 text-xs font-bold tracking-widest text-gold">
        TU ACCESO: {admin.roles.map((r) => ROLE_ES[r]).join(" · ").toUpperCase()}
      </p>
      {!admin.canEdit && (
        <p className="mt-2 text-xs text-muted-foreground">
          Como ayudante puedes ver todo, pero los cambios los guarda un admin o moderador.
        </p>
      )}

      <Overview />

      <nav className="mt-8 flex flex-wrap gap-2">
        {TABS.filter((t) => admin.isAdmin || !t.adminOnly).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border px-4 py-2 font-display text-sm font-bold ${
              tab === t.id
                ? "border-gold bg-gold text-gold-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "citas" && <BookingsPanel />}
        {tab === "barberos" && <ProsPanel />}
        {tab === "clientes" && <ClientsPanel />}
        {tab === "usuarios" && <UsersPanel admin={admin} />}
        {tab === "sponsors" && <SponsorsPanel />}
        {tab === "anuncios" && <SlidesPanel />}
        {tab === "solicitudes" && <RequestsPanel />}
      </div>
    </div>
  );
}

function Overview() {
  const { bookings } = useBookings();
  const { pages } = usePros();
  const { profiles } = useClients();
  const collected = bookings.reduce((a, b) => a + b.amountPaid - b.refunded, 0);
  const refunded = bookings.reduce((a, b) => a + b.refunded, 0);
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-5">
      <Stat label="CITAS" value={String(bookings.length)} />
      <Stat label="BARBEROS" value={String(pages.length)} />
      <Stat label="CLIENTES" value={String(profiles.length)} />
      <Stat label="COBRADO" value={money(collected)} />
      <Stat label="DEVUELTO" value={money(refunded)} />
    </section>
  );
}

/* ---------------- Citas ---------------- */

function BookingsPanel() {
  const { bookings, adminPatch, deleteBooking, refundBooking } = useBookings();
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const list = [...bookings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((b) => filter === "all" || b.status === filter);

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">Citas ({list.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | BookingStatus)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
        >
          <option value="all">Todas</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_ES[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {list.map((b) =>
          editing === b.id ? (
            <BookingEditor key={b.id} id={b.id} onClose={() => setEditing(null)} />
          ) : (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.barberSlug} · {b.dateISO} · {b.time} · {b.payMethod ?? "sin método"}
                </p>
              </div>
              <div className="text-sm">
                <p className="font-semibold">{money(b.amountPaid - b.refunded)}</p>
                <p className="text-xs text-muted-foreground">de {money(b.total)}</p>
              </div>
              <select
                value={b.status}
                onChange={(e) => {
                  void adminPatch(b.id, { status: e.target.value as BookingStatus })
                    .then(() => toast.success("Estado actualizado."))
                    .catch((err: Error) => toast.error(err.message));
                }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_ES[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setEditing(b.id)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:text-gold"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  refundBooking(b.id);
                  toast.success("Marcada como devuelta.");
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-gold"
              >
                Devolver
              </button>
              <button
                onClick={() => {
                  if (!confirm(`¿Borrar la cita de ${b.name}? No se puede deshacer.`)) return;
                  void deleteBooking(b.id)
                    .then(() => toast.success("Cita borrada."))
                    .catch((err: Error) => toast.error(err.message));
                }}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                aria-label="Borrar cita"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ),
        )}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No hay citas en este filtro.</p>}
      </div>
    </section>
  );
}

function BookingEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const { bookings, adminPatch } = useBookings();
  const b = bookings.find((x) => x.id === id);
  const [form, setForm] = useState({
    name: b?.name ?? "",
    dateISO: b?.dateISO ?? "",
    time: b?.time ?? "",
    total: String(b?.total ?? 0),
    amountPaid: String(b?.amountPaid ?? 0),
    refunded: String(b?.refunded ?? 0),
  });
  if (!b) return null;

  return (
    <div className="rounded-xl border border-gold/40 bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Fecha (AAAA-MM-DD)" value={form.dateISO} onChange={(v) => setForm({ ...form, dateISO: v })} />
        <Field label="Hora" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
        <Field label="Total $" value={form.total} onChange={(v) => setForm({ ...form, total: v })} />
        <Field label="Pagado $" value={form.amountPaid} onChange={(v) => setForm({ ...form, amountPaid: v })} />
        <Field label="Devuelto $" value={form.refunded} onChange={(v) => setForm({ ...form, refunded: v })} />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            void adminPatch(id, {
              name: form.name.trim(),
              dateISO: form.dateISO.trim(),
              time: form.time.trim(),
              total: Number(form.total) || 0,
              amountPaid: Number(form.amountPaid) || 0,
              refunded: Number(form.refunded) || 0,
            })
              .then(() => {
                toast.success("Cita actualizada.");
                onClose();
              })
              .catch((err: Error) => toast.error(err.message));
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
        >
          <Save size={15} /> Guardar
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-muted-foreground"
        >
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  );
}

/* ---------------- Barberos ---------------- */

function ProsPanel() {
  const { pages, savePage, removePage } = usePros();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", tagline: "" });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-bold">Barberos ({pages.length})</h2>
      <div className="mt-4 space-y-3">
        {pages.map((p) => (
          <div key={p.handle} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{p.handle} · {p.city}
                </p>
              </div>
              <Link to="/pro/$handle" params={{ handle: p.handle }} className="text-xs font-bold text-gold">
                Ver
              </Link>
              <button
                onClick={() => {
                  setEditing(editing === p.handle ? null : p.handle);
                  setForm({ name: p.name, city: p.city, tagline: p.tagline ?? "" });
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:text-gold"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (!confirm(`¿Borrar el perfil de ${p.name}?`)) return;
                  void removePage(p.handle)
                    .then(() => toast.success("Perfil borrado."))
                    .catch((err: Error) => toast.error(err.message));
                }}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                aria-label="Borrar barbero"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {editing === p.handle && (
              <div className="mt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Ciudad" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                  <Field label="Frase" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
                </div>
                <button
                  onClick={() => {
                    void savePage({ ...p, name: form.name, city: form.city, tagline: form.tagline })
                      .then(() => {
                        toast.success("Barbero actualizado.");
                        setEditing(null);
                      })
                      .catch((err: Error) => toast.error(err.message));
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
                >
                  <Save size={15} /> Guardar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Clientes ---------------- */

function ClientsPanel() {
  const { profiles, saveProfile, removeProfile } = useClients();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", tagline: "" });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-bold">Clientes ({profiles.length})</h2>
      <div className="mt-4 space-y-3">
        {profiles.map((c) => (
          <div key={c.handle} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{c.handle} · {c.city}
                </p>
              </div>
              <Link to="/u/$handle" params={{ handle: c.handle }} className="text-xs font-bold text-gold">
                Ver
              </Link>
              <button
                onClick={() => {
                  setEditing(editing === c.handle ? null : c.handle);
                  setForm({ name: c.name, city: c.city, tagline: c.tagline });
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:text-gold"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (!confirm(`¿Borrar el perfil de ${c.name}?`)) return;
                  void removeProfile(c.handle)
                    .then(() => toast.success("Perfil borrado."))
                    .catch((err: Error) => toast.error(err.message));
                }}
                className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                aria-label="Borrar cliente"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {editing === c.handle && (
              <div className="mt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Ciudad" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                  <Field label="Frase" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
                </div>
                <button
                  onClick={() => {
                    void saveProfile({ ...c, name: form.name, city: form.city, tagline: form.tagline })
                      .then(() => {
                        toast.success("Cliente actualizado.");
                        setEditing(null);
                      })
                      .catch((err: Error) => toast.error(err.message));
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
                >
                  <Save size={15} /> Guardar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Usuarios ---------------- */

function UsersPanel({ admin }: { admin: ReturnType<typeof useAdmin> }) {
  return (
    <section className="rounded-xl border border-gold/30 bg-card p-5">
      <h2 className="font-display text-lg font-bold">Usuarios ({admin.users.length})</h2>
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
  );
}

/* ---------------- Sponsors ---------------- */

function SponsorsPanel() {
  const { sponsors, saveSponsor, removeSponsor } = useSite();
  const [sp, setSp] = useState({ brand: "", tagline: "", offer: "", url: "", imageUrl: "" });

  return (
    <section className="rounded-xl border border-gold/30 bg-card p-5">
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
              onClick={() => setSp({
                brand: s2.brand,
                tagline: s2.tagline ?? "",
                offer: s2.offer ?? "",
                url: s2.url,
                imageUrl: s2.imageUrl ?? "",
              })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:text-gold"
            >
              Editar
            </button>
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
  );
}

/* ---------------- Anuncios ---------------- */

function SlidesPanel() {
  const { slides, addSlide, updateSlide, removeSlide } = useSite();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  return (
    <>
      <section className="rounded-xl border border-gold/30 bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Film size={17} className="text-gold" /> Nuevo slide de portada
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

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Slides en portada ({slides.length})</h2>
        <div className="mt-3 space-y-3">
          {slides.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {s.videoUrl ? (
                  <video src={s.videoUrl} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  value={s.title}
                  onChange={(e) => updateSlide(s.id, { title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                />
                <input
                  value={s.subtitle ?? ""}
                  onChange={(e) => updateSlide(s.id, { subtitle: e.target.value })}
                  placeholder="Texto corto"
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                />
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
          {slides.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay slides.</p>}
        </div>
      </section>
    </>
  );
}

/* ---------------- Solicitudes ---------------- */

function RequestsPanel() {
  const { requests, cancelRequest, leads } = useSite();
  return (
    <>
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Solicitudes a celebrities ({requests.length})</h2>
        <div className="mt-3 space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-sm">
              <div className="min-w-[180px] flex-1">
                <p className="font-semibold">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.celebSlug} · {r.status}
                </p>
              </div>
              <button
                onClick={() => {
                  cancelRequest(r.id);
                  toast.success("Solicitud cancelada.");
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-destructive"
              >
                Cancelar
              </button>
            </div>
          ))}
          {requests.length === 0 && <p className="text-sm text-muted-foreground">No hay solicitudes.</p>}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Afiliados & sponsors interesados ({leads.length})</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {leads.map((l) => (
            <li key={l.id} className="rounded-xl border border-border p-3">
              <p className="font-semibold">{l.name}</p>
              <p className="text-xs text-muted-foreground">{l.email}</p>
            </li>
          ))}
          {leads.length === 0 && <p className="text-sm text-muted-foreground">Nadie se ha registrado todavía.</p>}
        </ul>
      </section>
    </>
  );
}

/* ---------------- UI helpers ---------------- */

function Gate({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function LinkBtn({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-block rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-gold-foreground hover:bg-gold/90"
    >
      {children}
    </Link>
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
