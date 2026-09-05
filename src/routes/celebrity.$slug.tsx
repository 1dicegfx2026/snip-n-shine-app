import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Music2, Heart, MessageSquare, PartyPopper, ArrowLeft } from "lucide-react";
import { getCelebrity, formatFollowers, CELEBRITIES } from "@/lib/data/celebrities";
import { useSite, PAY_METHODS, type PayMethod } from "@/lib/site-store";
import { nextNDates } from "@/lib/data/barbers";
import { toast } from "sonner";

export const Route = createFileRoute("/celebrity/$slug")({
  loader: ({ params }) => {
    const celeb = getCelebrity(params.slug);
    return { slug: params.slug, celeb: celeb ?? null };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.celeb?.name ?? "Artista";
    return {
      meta: [
        { title: `${name} — Perfil y appointments | GILT` },
        {
          name: "description",
          content: `Perfil de ${name} en GILT: su música, su galería, su vibra y su agenda para hacer appointment directo.`,
        },
        { property: "og:title", content: `${name} — Perfil y appointments | GILT` },
        { property: "og:description", content: `Reserva directo con ${name} en GILT.` },
      ],
    };
  },
  component: CelebPage,
});

function CelebPage() {
  const { slug, celeb: seeded } = Route.useLoaderData();
  const { celebProfiles, addRequest } = useSite();
  const celeb = seeded ?? celebProfiles.find((c) => c.slug === slug);

  const [serviceId, setServiceId] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [sent, setSent] = useState(false);

  const days = nextNDates(14);

  if (!celeb) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Este perfil no existe todavía</h1>
        <Link to="/celebrities" className="mt-4 inline-block text-sm font-semibold text-gold hover:underline">
          Ver todos los artistas
        </Link>
      </div>
    );
  }

  const service = celeb.services.find((s) => s.id === serviceId);
  const friends = celeb.topFriends
    .map((f) => CELEBRITIES.find((c) => c.slug === f) ?? celebProfiles.find((c) => c.slug === f))
    .filter(Boolean);
  const canSend = Boolean(service && dateISO && time && name.trim() && contact.trim());
  const methodHint = PAY_METHODS.find((m) => m.id === payMethod)?.hint;

  return (
    <div style={{ background: celeb.themeBg }}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/celebrities"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-gold"
        >
          <ArrowLeft size={15} /> Artistas celebrity
        </Link>

        {/* Banner */}
        <div
          className="mt-4 overflow-hidden rounded-2xl border"
          style={{ borderColor: celeb.themeAccent }}
        >
          <div className="relative h-40 sm:h-56">
            <img src={celeb.banner} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${celeb.themeBg}, transparent)` }} />
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <img
              src={celeb.avatar}
              alt={celeb.name}
              loading="lazy"
              className="-mt-16 h-28 w-28 rounded-xl border-4 object-cover"
              style={{ borderColor: celeb.themeAccent }}
            />
            <div className="flex-1">
              <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold">
                {celeb.name}
                {celeb.verified && <BadgeCheck size={20} style={{ color: celeb.themeAccent }} />}
              </h1>
              <p className="text-sm font-semibold tracking-[0.2em]" style={{ color: celeb.themeAccent }}>
                {celeb.alias}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {celeb.role} · {celeb.city} · {formatFollowers(celeb.followers)} fans
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-black/30 p-3 text-xs">
              <p className="font-semibold">Mood: {celeb.mood}</p>
              <p className="mt-1 text-muted-foreground">{celeb.status}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* MySpace-style left rail */}
          <aside className="space-y-5">
            <Panel accent={celeb.themeAccent} title="Sobre mí">
              <p className="text-sm leading-relaxed text-muted-foreground">{celeb.bio}</p>
            </Panel>

            {celeb.tracks.length > 0 && (
              <Panel accent={celeb.themeAccent} title="Mi música">
                <ul className="space-y-2 text-sm">
                  {celeb.tracks.map((t) => (
                    <li key={t.title} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Music2 size={14} style={{ color: celeb.themeAccent }} /> {t.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{t.length}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {friends.length > 0 && (
              <Panel accent={celeb.themeAccent} title="Top friends">
                <div className="grid grid-cols-3 gap-2">
                  {friends.map((f) => (
                    <Link
                      key={f!.slug}
                      to="/celebrity/$slug"
                      params={{ slug: f!.slug }}
                      className="text-center"
                    >
                      <img src={f!.avatar} alt={f!.name} loading="lazy" className="h-16 w-full rounded-lg object-cover" />
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{f!.name}</span>
                    </Link>
                  ))}
                </div>
              </Panel>
            )}

            {celeb.guestbook.length > 0 && (
              <Panel accent={celeb.themeAccent} title="Guestbook">
                <ul className="space-y-3 text-sm">
                  {celeb.guestbook.map((g, i) => (
                    <li key={i}>
                      <p className="flex items-center gap-1.5 text-xs font-bold">
                        <MessageSquare size={12} style={{ color: celeb.themeAccent }} /> {g.author}
                        <span className="font-normal text-muted-foreground">· {g.date}</span>
                      </p>
                      <p className="text-muted-foreground">{g.text}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <Panel accent={celeb.themeAccent} title="Galería">
              <div className="grid grid-cols-3 gap-2">
                {celeb.gallery.map((g, i) => (
                  <img key={i} src={g} alt="" loading="lazy" className="h-28 w-full rounded-lg object-cover" />
                ))}
              </div>
            </Panel>

            {sent && service ? (
              <Panel accent={celeb.themeAccent} title="Solicitud enviada">
                <div className="text-center">
                  <PartyPopper size={30} className="mx-auto" style={{ color: celeb.themeAccent }} />
                  <p className="mt-3 font-display text-xl font-bold">Va en camino a {celeb.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.name} el {dateISO} a las {time}. Pago por{" "}
                    <b className="text-foreground">{PAY_METHODS.find((m) => m.id === payMethod)?.label}</b>. Te
                    contactamos a {contact} para confirmar. Modo demo — no se cobró nada.
                  </p>
                  <Link to="/celebrities" className="mt-5 inline-block text-sm font-semibold text-gold hover:underline">
                    Ver mis solicitudes
                  </Link>
                </div>
              </Panel>
            ) : (
              <Panel accent={celeb.themeAccent} title="Hacer appointment directo">
                <div className="grid gap-2">
                  {celeb.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className="flex items-center justify-between rounded-xl border p-4 text-left transition-colors"
                      style={{
                        borderColor: serviceId === s.id ? celeb.themeAccent : "var(--color-border)",
                        background: serviceId === s.id ? `${celeb.themeAccent}1a` : "transparent",
                      }}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{s.name}</span>
                        <span className="block text-xs text-muted-foreground">{s.note}</span>
                      </span>
                      <span className="font-display font-bold" style={{ color: celeb.themeAccent }}>
                        ${s.price}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {days.map((d) => (
                    <button
                      key={d.iso}
                      onClick={() => setDateISO(d.iso)}
                      className="flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5"
                      style={{
                        borderColor: dateISO === d.iso ? celeb.themeAccent : "var(--color-border)",
                        background: dateISO === d.iso ? `${celeb.themeAccent}1a` : "transparent",
                      }}
                    >
                      <span className="text-[11px] uppercase text-muted-foreground">{d.weekday}</span>
                      <span className="font-display text-lg font-bold">{d.day}</span>
                      <span className="text-[11px] text-muted-foreground">{d.month}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Hora que prefieres" value={time} onChange={setTime} placeholder="7:30 PM" />
                  <Input label="Tu nombre" value={name} onChange={setName} placeholder="Jordan Rivera" />
                  <Input label="Teléfono o email" value={contact} onChange={setContact} placeholder="787-000-0000" />
                  <Input label="Mensaje (opcional)" value={message} onChange={setMessage} placeholder="Es para el cumpleaños de mi pana" />
                </div>

                <p className="mt-4 text-xs font-semibold text-muted-foreground">Método de pago</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className="rounded-lg border px-3 py-2 text-xs font-bold"
                      style={{
                        borderColor: payMethod === m.id ? celeb.themeAccent : "var(--color-border)",
                        background: payMethod === m.id ? `${celeb.themeAccent}1a` : "transparent",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{methodHint}</p>

                <button
                  disabled={!canSend}
                  onClick={() => {
                    if (!service) return;
                    addRequest({
                      celebSlug: celeb.slug,
                      celebName: celeb.name,
                      serviceName: service.name,
                      price: service.price,
                      dateISO,
                      time,
                      name: name.trim(),
                      contact: contact.trim(),
                      payMethod,
                      message: message.trim(),
                    });
                    setSent(true);
                    toast.success(`Solicitud enviada a ${celeb.name}`);
                    window.scrollTo({ top: 0 });
                  }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-display text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: celeb.themeAccent }}
                >
                  <Heart size={16} /> Enviar solicitud
                </button>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <h2
        className="px-4 py-2 font-display text-sm font-bold text-black"
        style={{ background: accent }}
      >
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Input({
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
