import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DollarSign,
  CalendarCheck,
  Star,
  Hourglass,
  TrendingUp,
  UserCheck,
  Receipt,
  FileText,
  Radio,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { getBarber, nextNDates, formatDateLong } from "@/lib/data/barbers";
import { PLANS } from "@/lib/data/pro-pages";
import { useBookings } from "@/lib/booking-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Barberos Premium — Panel GILT" },
      {
        name: "description",
        content:
          "Panel del barbero: agenda, depósitos, cobro al llegar el cliente, reembolsos, ganancias y resumen 1099.",
      },
      { property: "og:title", content: "Barberos Premium — Panel GILT" },
      {
        property: "og:description",
        content: "Agenda, depósitos, cobros, reembolsos, ganancias y 1099 en un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const DEMO_TODAY = [
  { time: "9:00 AM", client: "Devon W.", service: "Signature Skin Fade", status: "done" },
  { time: "10:30 AM", client: "Chris P.", service: "The Full Works", status: "done" },
  { time: "12:00 PM", client: "Andre L.", service: "Beard Sculpt & Hot Towel", status: "next" },
];

const DEMO_WAITLIST = [
  { client: "Jordan R.", wants: "Hoy después de las 5 PM" },
  { client: "Trey B.", wants: "Mañana por la mañana" },
];

const money = (n: number) => `$${n.toFixed(2)}`;

function DashboardPage() {
  const barber = getBarber("marcus-cole")!;
  const {
    bookings,
    waitlist,
    markArrived,
    completeBooking,
    cancelBooking,
    refundBooking,
    depositRateFor,
    setDepositRate,
  } = useBookings();

  const [planId, setPlanId] = useState("basic");
  const plan = PLANS.find((p) => p.id === planId)!;
  const rate = depositRateFor(barber.slug);

  const days = nextNDates(1);
  const todayISO = days[0]?.iso ?? "";

  const mine = bookings.filter((b) => b.barberSlug === barber.slug);
  const todays = mine.filter(
    (b) => b.dateISO === todayISO && b.status !== "cancelled" && b.status !== "refunded",
  );

  const earnings = useMemo(() => {
    const collected = mine.reduce((sum, b) => sum + b.amountPaid, 0);
    const refunds = mine.reduce((sum, b) => sum + b.refunded, 0);
    const commission = mine.reduce((sum, b) => sum + b.amountPaid * b.commissionRate, 0);
    return { collected, refunds, commission, net: collected - commission };
  }, [mine]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={barber.avatar}
            alt={`Retrato de ${barber.name}`}
            width={512}
            height={512}
            className="h-14 w-14 rounded-xl border border-gold/30 object-cover"
          />
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">BARBEROS PREMIUM</p>
            <h1 className="font-display text-2xl font-extrabold">
              Buen día, {barber.name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <Link
          to="/barber/$slug"
          params={{ slug: barber.slug }}
          className="self-start rounded-xl border border-gold/40 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 sm:self-auto"
        >
          Ver mi página pública
        </Link>
      </div>

      {/* Cómo funciona el dinero */}
      <section className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-br from-emerald-deep to-card p-6">
        <h2 className="font-display text-lg font-bold">Cómo entra tu dinero</h2>
        <ol className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
          <li>
            <b className="text-foreground">1. Reserva</b> — el cliente paga{" "}
            <b className="text-gold">{Math.round(rate * 100)}%</b> de depósito para apartar la silla.
          </li>
          <li>
            <b className="text-foreground">2. Llega</b> — le das “Cliente llegó” y se cobra el resto
            antes de empezar el corte.
          </li>
          <li>
            <b className="text-foreground">3. Se deposita</b> — el pago va directo a tu cuenta; GILT
            retiene solo su <b className="text-gold">{Math.round(plan.commission * 100)}%</b>.
          </li>
          <li>
            <b className="text-foreground">4. Impuestos</b> — todo queda registrado y en enero bajas
            tu 1099 desde aquí.
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Modo demo: todavía no se cobra dinero real. Al activar pagos, este mismo flujo funciona con
          tarjeta, Zelle, Cash App, Apple Pay, PayPal y Venmo.
        </p>
      </section>

      {/* Ajustes de depósito y plan */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Percent size={17} className="text-gold" /> Tu depósito
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tú decides cuánto se cobra al reservar. El resto se cobra cuando el cliente llega.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[0.2, 0.25, 0.3, 0.4, 0.5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDepositRate(barber.slug, r);
                  toast.success(`Depósito actualizado a ${Math.round(r * 100)}%`);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
                  Math.abs(rate - r) < 0.001
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border hover:border-gold/40"
                }`}
              >
                {Math.round(r * 100)}%
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Radio size={17} className="text-gold" /> Tu membresía
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
                  planId === p.id ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold/40"
                }`}
              >
                {p.name} · ${p.price}/mes
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Comisión por corte con este plan: <b className="text-gold">{Math.round(plan.commission * 100)}%</b>.
          </p>
          {plan.id === "elite" ? (
            <button
              onClick={() => toast.success("Transmisión iniciada (demo) — tus clientes reciben aviso.")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
            >
              <Radio size={16} /> Salir en vivo ahora
            </button>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-gold/40 p-3 text-xs text-muted-foreground">
              El live directo desde la app es exclusivo del plan <b className="text-gold">Elite ($99)</b>.{" "}
              <Link to="/pricing" className="text-gold hover:underline">
                Subir de plan
              </Link>
            </p>
          )}
        </section>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "Cobrado (neto)", value: money(earnings.net), sub: `${money(earnings.commission)} de comisión GILT` },
          { icon: CalendarCheck, label: "Citas registradas", value: String(mine.length), sub: `${todays.length} hoy` },
          { icon: Star, label: "Rating", value: barber.rating.toFixed(2), sub: `${barber.reviewCount} reseñas` },
          {
            icon: Hourglass,
            label: "En lista de espera",
            value: String(DEMO_WAITLIST.length + waitlist.filter((w) => w.barberSlug === barber.slug).length),
            sub: "auto-relleno activo",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <s.icon size={18} className="text-gold" />
            <p className="mt-3 font-display text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-primary">
              <TrendingUp size={11} /> {s.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Agenda de hoy */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold">
              Agenda de hoy — {formatDateLong(todayISO)}
            </h2>
            <div className="mt-4 divide-y divide-border">
              {DEMO_TODAY.map((a) => (
                <div key={a.time} className="flex items-center gap-4 py-3.5">
                  <span className="w-20 shrink-0 font-display text-sm font-bold text-gold">{a.time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.client}</p>
                    <p className="text-xs text-muted-foreground">{a.service}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      a.status === "done" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                    }`}
                  >
                    {a.status === "done" ? "Terminado" : "Siguiente"}
                  </span>
                </div>
              ))}

              {todays.map((b) => {
                const service = barber.services.find((s) => s.id === b.serviceId);
                const pending = b.total - b.amountPaid;
                return (
                  <div key={b.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <span className="w-20 shrink-0 font-display text-sm font-bold text-gold">{b.time}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service?.name} · {money(b.amountPaid)} cobrado
                        {pending > 0 ? ` · falta ${money(pending)}` : " · pagado completo"}
                      </p>
                    </div>
                    {b.status === "upcoming" ? (
                      <button
                        onClick={() => {
                          markArrived(b.id);
                          toast.success(`Cliente llegó — cobrados ${money(pending)} restantes.`);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/85"
                      >
                        <UserCheck size={14} /> Cliente llegó · cobrar {money(pending)}
                      </button>
                    ) : b.status === "arrived" ? (
                      <button
                        onClick={() => {
                          completeBooking(b.id);
                          toast.success("Corte marcado como terminado.");
                        }}
                        className="rounded-lg border border-gold/40 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10"
                      >
                        Marcar terminado
                      </button>
                    ) : (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                        Terminado
                      </span>
                    )}
                  </div>
                );
              })}

              {todays.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">
                  Aún no hay reservas nuevas para hoy.
                </p>
              )}
            </div>
          </section>

          {/* Pagos */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Receipt size={18} className="text-gold" /> Cortes y pagos
            </h2>
            {mine.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Cuando entren reservas, cada pago, comisión y reembolso aparece aquí.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {mine
                  .slice()
                  .reverse()
                  .map((b) => {
                    const service = barber.services.find((s) => s.id === b.serviceId);
                    const fee = b.amountPaid * b.commissionRate;
                    return (
                      <div key={b.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {b.name} · {service?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateLong(b.dateISO)} · {b.time} · {b.payMethod ?? "tarjeta"}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-bold text-foreground">{money(b.amountPaid)}</p>
                          <p className="text-muted-foreground">
                            comisión {money(fee)} · neto {money(b.amountPaid - fee)}
                          </p>
                          {b.refunded > 0 && (
                            <p className="text-destructive">reembolsado {money(b.refunded)}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {b.status !== "cancelled" && b.status !== "refunded" && (
                            <>
                              <button
                                onClick={() => {
                                  cancelBooking(b.id);
                                  toast.info("Cita cancelada — la hora vuelve a estar libre.");
                                }}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                              >
                                Cancelar
                              </button>
                              {b.amountPaid > 0 && (
                                <button
                                  onClick={() => {
                                    refundBooking(b.id);
                                    toast.success(`Reembolso de ${money(b.amountPaid)} enviado.`);
                                  }}
                                  className="rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10"
                                >
                                  Reembolsar
                                </button>
                              )}
                            </>
                          )}
                          {b.status === "refunded" && (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                              Reembolsado
                            </span>
                          )}
                          {b.status === "cancelled" && (
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                              Cancelada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>

        {/* Lateral */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-gold/30 bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <FileText size={17} className="text-gold" /> Impuestos · 1099
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Cobrado bruto" value={money(earnings.collected + earnings.refunds)} />
              <Row label="Reembolsos" value={`- ${money(earnings.refunds)}`} />
              <Row label="Comisión GILT" value={`- ${money(earnings.commission)}`} />
              <div className="hairline-gold my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Ingreso neto del año</span>
                <span className="font-display font-extrabold text-gold">{money(earnings.net)}</span>
              </div>
            </div>
            <button
              onClick={() => toast.success("1099 generado (demo) — se enviará en enero.")}
              className="mt-4 w-full rounded-xl border border-gold/40 px-4 py-2.5 text-sm font-bold text-gold hover:bg-gold/10"
            >
              Descargar 1099
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Se emite automáticamente cuando pasas el umbral del IRS del año.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Lista de espera</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Cuando se abre una hora, el siguiente cliente entra y recibe aviso automático.
            </p>
            <div className="mt-4 space-y-3">
              {DEMO_WAITLIST.map((w, i) => (
                <div key={w.client} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{w.client}</p>
                    <p className="text-xs text-muted-foreground">{w.wants}</p>
                  </div>
                </div>
              ))}
              {waitlist
                .filter((w) => w.barberSlug === barber.slug)
                .map((w) => (
                  <div key={w.id} className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                      ★
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Cliente en espera</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLong(w.dateISO)} · {w.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
