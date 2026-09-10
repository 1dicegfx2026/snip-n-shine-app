import { AuthGate } from "@/components/AuthGate";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, ShieldCheck, PartyPopper } from "lucide-react";
import { getBarber, getSlots, nextNDates, formatDateLong } from "@/lib/data/barbers";
import { BASE_COMMISSION } from "@/lib/data/pro-pages";
import { useBookings } from "@/lib/booking-store";
import { PAY_METHODS, OFFLINE_PAY_METHODS, type PayMethod } from "@/lib/site-store";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$slug")({
  validateSearch: (s: Record<string, unknown>) => ({
    service: typeof s["service"] === "string" ? (s["service"] as string) : "",
    date: typeof s["date"] === "string" ? (s["date"] as string) : "",
    time: typeof s["time"] === "string" ? (s["time"] as string) : "",
  }),
  loader: ({ params }) => {
    const barber = getBarber(params.slug);
    if (!barber) throw notFound();
    return barber;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Book ${loaderData?.name ?? "appointment"} — GILT` },
      { name: "description", content: "Reserve your chair with a secure deposit. Live availability, instant confirmation." },
      { property: "og:title", content: `Book ${loaderData?.name ?? "appointment"} — GILT` },
      { property: "og:description", content: "Reserve your chair with a secure deposit on GILT." },
    ],
  }),
  component: GuardedBookingFlow,
});

function BookingFlow() {
  const barber = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { addBooking, bookedTimesFor, depositRateFor } = useBookings();
  const depositRate = depositRateFor(barber.slug);

  const [serviceId, setServiceId] = useState(search.service);
  const [dateISO, setDateISO] = useState(search.date);
  const [time, setTime] = useState(search.time);
  const [name, setName] = useState("");
  const [payType, setPayType] = useState<"deposit" | "full">("deposit");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [confirmed, setConfirmed] = useState(false);

  const { settings } = usePlatformSettings();
  const enabledPay = useMemo<PayMethod[]>(() => {
    const list: PayMethod[] = [];
    if (settings.payCard) list.push("card");
    if (settings.payZelle) list.push("zelle");
    if (settings.payCashapp) list.push("cashapp");
    if (settings.payCash) list.push("cash");
    return list.length ? list : ["card"];
  }, [settings]);

  useEffect(() => {
    if (!enabledPay.includes(payMethod)) setPayMethod(enabledPay[0] as PayMethod);
  }, [enabledPay, payMethod]);

  const service = barber.services.find((s) => s.id === serviceId);
  const days = useMemo(() => nextNDates(14), []);
  const slots = dateISO ? getSlots(barber, dateISO, bookedTimesFor(barber.slug, dateISO)) : [];

  const total = service?.price ?? 0;
  const offline = OFFLINE_PAY_METHODS.includes(payMethod);
  const dueToday = offline ? 0 : payType === "deposit" ? Math.round(total * depositRate) : total;

  const missing = [
    !service && "escoger el servicio",
    !dateISO && "escoger el día",
    !time && "escoger la hora",
    !name.trim() && "escribir tu nombre",
  ].filter(Boolean) as string[];
  const canConfirm = missing.length === 0;

  if (confirmed && service) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <PartyPopper size={28} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold">You're booked.</h1>
        <p className="mt-3 text-muted-foreground">
          {service.name} with {barber.name} on <b className="text-foreground">{formatDateLong(dateISO)}</b> at{" "}
          <b className="text-foreground">{slots.find((s) => s.time === time)?.label ?? time}</b>.
        </p>
        <div className="mt-6 rounded-xl border border-gold/30 bg-card p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {offline
                ? `Pagas al llegar (${PAY_METHODS.find((m) => m.id === payMethod)?.label})`
                : `Paid today (${payType === "deposit" ? `${Math.round(depositRate * 100)}% deposit` : "full"})`}
            </span>
            <span className="font-bold text-gold">${offline ? total : dueToday}</span>
          </div>
          {!offline && (
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Due at the chair</span>
              <span className="font-semibold">${total - dueToday}</span>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {offline
            ? "Sin tarjeta: el barbero confirma tu pago en la barbería. Recordatorios 24h antes (email) y 2h antes (SMS)."
            : "Reminders set: 24h before (email) and 2h before (SMS). Demo mode — no card was charged."}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/bookings"
            className="rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
          >
            View my bookings
          </Link>
          <Link
            to="/explore"
            search={{ q: "" }}
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
          >
            Keep exploring
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/barber/$slug"
        params={{ slug: barber.slug }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-gold"
      >
        <ArrowLeft size={15} /> {barber.name}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold">
        Book {barber.name.split(" ")[0]}'s chair
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {barber.shop} · {barber.neighborhood}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* 1 — Service */}
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <StepBadge n={1} done={Boolean(service)} /> Choose a service
            </h2>
            <div className="mt-3 grid gap-2">
              {barber.services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    serviceId === s.id
                      ? "border-gold bg-gold/10"
                      : "border-border bg-card hover:border-muted-foreground/40"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.durationMin} min</p>
                  </div>
                  <span className="font-display font-bold text-gold">${s.price}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2 — Date */}
          <section>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <StepBadge n={2} done={Boolean(dateISO)} /> Pick a day
            </h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => (
                <button
                  key={d.iso}
                  onClick={() => {
                    setDateISO(d.iso);
                    setTime("");
                  }}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-3 transition-colors ${
                    dateISO === d.iso
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-card hover:border-muted-foreground/40"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">{d.weekday}</span>
                  <span className="font-display text-xl font-bold">{d.day}</span>
                  <span className="text-[11px] text-muted-foreground">{d.month}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 3 — Time */}
          {dateISO && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <StepBadge n={3} done={Boolean(time)} /> Pick a time — {formatDateLong(dateISO)}
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.status === "booked"}
                    onClick={() => setTime(s.time)}
                    className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                      s.status === "booked"
                        ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through"
                        : time === s.time
                          ? "border-gold bg-gold text-gold-foreground"
                          : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/25"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 4 — Details & payment */}
          {time && service && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <StepBadge n={4} done={false} /> Your details & deposit
              </h2>
              <div className="mt-3 space-y-4 rounded-xl border border-border bg-card p-5">
                <div>
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                     placeholder="Escribe tu nombre completo"
                    className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                </div>

                {offline ? (
                  <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
                    <p className="text-sm font-bold text-gold">Pagas ${total} sin tarjeta</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Hoy no se cobra nada. El barbero confirma tu pago cuando llegues a la cita.
                    </p>
                  </div>
                ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => setPayType("deposit")}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      payType === "deposit" ? "border-gold bg-gold/10" : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <p className="text-sm font-bold">{Math.round(depositRate * 100)}% deposit — ${Math.round(total * depositRate)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Secures your slot. Pay the rest at the chair.
                    </p>
                  </button>
                  <button
                    onClick={() => setPayType("full")}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      payType === "full" ? "border-gold bg-gold/10" : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <p className="text-sm font-bold">Pay in full — ${total}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Skip the counter entirely.</p>
                  </button>
                </div>
                )}


                <div className="rounded-lg border border-dashed border-border bg-background p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CreditCard size={14} /> Método de pago
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PAY_METHODS.filter((m) => enabledPay.includes(m.id)).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                          payMethod === m.id
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {payMethod === "card" ? (
                    <div className="mt-3 grid gap-2">
                      <input
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        className="rounded-lg border border-input bg-card px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="MM / YY"
                          className="rounded-lg border border-input bg-card px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                        />
                        <input
                          placeholder="CVC"
                          inputMode="numeric"
                          className="rounded-lg border border-input bg-card px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                      {PAY_METHODS.find((m) => m.id === payMethod)?.hint}
                    </p>
                  )}

                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck size={12} className="text-primary" /> Demo checkout — no real charge is made.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-gold/30 bg-card p-5">
            <h2 className="font-display text-lg font-bold">Summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <Row label="Pro" value={barber.name} />
              <Row label="Service" value={service ? `${service.name} (${service.durationMin} min)` : "—"} />
              <Row label="Date" value={dateISO ? formatDateLong(dateISO) : "—"} />
              <Row
                label="Time"
                value={time ? (slots.find((s) => s.time === time)?.label ?? time) : "—"}
              />
              <div className="my-3 hairline-gold" />
              <Row label="Total" value={`$${total}`} />
              <div className="flex justify-between text-base">
                <span className="font-semibold">{offline ? "Pagas en la cita" : "Due today"}</span>
                <span className="font-display font-extrabold text-gold">${offline ? total : dueToday}</span>
              </div>
            </div>
            <button
              onClick={() => {
                 if (!canConfirm) {
                   toast.error(`Para confirmar te falta: ${missing.join(", ")}.`);
                   if (!name.trim() && time && service) {
                     document.getElementById("name")?.focus();
                   }
                   return;
                 }
                if (!service) return;
                addBooking({
                  barberSlug: barber.slug,
                  serviceId: service.id,
                  dateISO,
                  time,
                  name: name.trim(),
                  payType,
                  payMethod,
                  amountPaid: dueToday,
                  depositRate,
                  commissionRate: BASE_COMMISSION,
                  total,
                });
                setConfirmed(true);
                toast.success("Appointment confirmed — see you in the chair.");
                window.scrollTo({ top: 0 });
              }}
               aria-disabled={!canConfirm}
               className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-display text-sm font-bold transition-colors ${
                 canConfirm
                   ? "bg-primary text-primary-foreground hover:bg-primary/85"
                   : "border border-gold/50 bg-gold/10 text-gold hover:bg-gold/15"
               }`}
            >
              Confirm booking <ArrowRight size={16} />
            </button>
            {!canConfirm && (
              <p className="mt-3 rounded-lg border border-dashed border-gold/40 bg-gold/5 px-3 py-2 text-center text-[11px] font-semibold text-gold">
                Para confirmar te falta: {missing.join(", ")}.
              </p>
            )}
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Free cancellation up to 4h before. Reminders by email & SMS.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
        done ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {done ? <Check size={13} /> : n}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function GuardedBookingFlow() {
  return (
    <AuthGate title="Reserva tu cita">
      <BookingFlow />
    </AuthGate>
  );
}
