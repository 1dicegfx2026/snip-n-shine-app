import { AuthGate } from "@/components/AuthGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarX, BellRing, Hourglass, CalendarPlus, ArrowRight, Pencil, X, Check, Eye, MapPin, CreditCard, AlertTriangle, CalendarDays, Trophy, Star } from "lucide-react";
import { downloadICS } from "@/lib/calendar";
import { ReviewForm } from "@/components/ReviewForm";
import { ShareButton } from "@/components/ShareButton";
import { useReviews } from "@/lib/review-store";
import { getBarber, formatDateLong, getSlots, nextNDates } from "@/lib/data/barbers";
import { useBookings } from "@/lib/booking-store";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useAdmin } from "@/lib/admin";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — GILT" },
      { name: "description", content: "Your upcoming appointments, reminders and waitlist spots on GILT." },
      { property: "og:title", content: "My Bookings — GILT" },
      { property: "og:description", content: "Your upcoming appointments, reminders and waitlist spots." },
    ],
  }),
  component: GuardedBookingsPage,
});

function slotLabel(time: string) {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const ampm = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${mStr} ${ampm}`;
}

function BookingEditCard({
  booking,
  onDone,
}: {
  booking: ReturnType<typeof useBookings>["bookings"][number];
  onDone: () => void;
}) {
  const { updateBooking, adminPatch, bookedTimesFor } = useBookings();
  const admin = useAdmin();
  const barber = getBarber(booking.barberSlug);
  const days = useMemo(() => nextNDates(14), []);
  const [serviceId, setServiceId] = useState(booking.serviceId);
  const [dateISO, setDateISO] = useState(booking.dateISO);
  const [time, setTime] = useState(booking.time);
  const [customTotal, setCustomTotal] = useState(String(booking.total));
  const [saving, setSaving] = useState(false);

  if (!barber) return null;
  const service = barber.services.find((s) => s.id === serviceId);
  const slots = dateISO ? getSlots(barber, dateISO, bookedTimesFor(barber.slug, dateISO)) : [];
  const serviceTotal = service?.price ?? booking.total;
  const enteredTotal = Number(customTotal);
  const newTotal = admin.canEdit && Number.isFinite(enteredTotal) ? enteredTotal : serviceTotal;
  const balance = Math.max(0, newTotal - booking.amountPaid);
  const refundDue = Math.max(0, booking.amountPaid - newTotal);

  const handleSave = async () => {
    if (!serviceId || !dateISO || !time) {
      toast.error("Elige servicio, día y hora.");
      return;
    }
    if (admin.canEdit && (!Number.isFinite(enteredTotal) || enteredTotal < 0)) {
      toast.error("Escribe un precio válido.");
      return;
    }
    setSaving(true);
    try {
      await updateBooking(booking.id, { serviceId, dateISO, time });
      if (admin.canEdit) await adminPatch(booking.id, { total: enteredTotal });
      toast.success(admin.canEdit ? "Cita y precio actualizados." : "Cita actualizada y guardada.");
      onDone();
    } catch {
      toast.error("No se pudo guardar el cambio. Inténtalo otra vez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-gold/40 bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <img
          src={barber.avatar}
          alt={`Portrait of ${barber.name}`}
          loading="lazy"
          width={512}
          height={512}
          className="h-16 w-16 rounded-xl border border-gold/30 object-cover"
        />
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Servicio</label>
            <select
              value={serviceId}
              onChange={(e) => {
                const nextServiceId = e.target.value;
                setServiceId(nextServiceId);
                const nextService = barber.services.find((item) => item.id === nextServiceId);
                if (nextService) setCustomTotal(String(nextService.price));
              }}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {barber.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${s.price}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Día</label>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    setDateISO(d.iso);
                    setTime("");
                  }}
                  className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-2 py-2 text-xs transition-colors ${
                    dateISO === d.iso
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-border bg-card hover:border-gold/50"
                  }`}
                >
                  <span className="uppercase">{d.weekday}</span>
                  <span className="font-display text-lg font-bold">{d.day}</span>
                  <span className="uppercase">{d.month}</span>
                </button>
              ))}
            </div>
          </div>
          {dateISO && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Hora</label>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((s) => {
                  const taken = s.status === "booked" && s.time !== booking.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={taken}
                      onClick={() => setTime(s.time)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                        time === s.time
                          ? "border-gold bg-gold/15 text-gold"
                          : taken
                            ? "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                            : "border-border bg-card hover:border-gold/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {admin.canEdit && (
            <div>
              <label htmlFor={`booking-price-${booking.id}`} className="text-xs font-semibold text-muted-foreground">
                Precio acordado ($)
              </label>
              <input
                id={`booking-price-${booking.id}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={customTotal}
                onChange={(event) => setCustomTotal(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/50 bg-background px-3 py-2 text-sm font-bold text-gold"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Precio normal del servicio: ${serviceTotal.toFixed(2)}. Solo el equipo puede cambiar el precio final.
              </p>
            </div>
          )}
          <div className="space-y-2 rounded-lg bg-gold/5 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nuevo total</span>
              <span className="font-bold text-gold">${newTotal.toFixed(2)}</span>
            </div>
            {admin.canEdit && (
              <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-muted-foreground">{refundDue > 0 ? "Devolución pendiente" : "Saldo pendiente"}</span>
                <span className={refundDue > 0 ? "font-bold text-destructive" : "font-bold text-foreground"}>
                  ${(refundDue > 0 ? refundDue : balance).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/85 disabled:opacity-50"
            >
              <Check size={14} /> Guardar
            </button>
            <button
              onClick={onDone}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
            >
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsPage() {
  const { bookings, waitlist, cancelBooking, leaveWaitlist } = useBookings();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { reviewFor } = useReviews();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const mine = bookings.filter((b) => b.clientId === user?.id);
  const upcoming = mine.filter((b) => b.status === "upcoming" || b.status === "arrived");
  const past = mine.filter((b) => b.status === "completed");
  const cancelled = mine.filter((b) => b.status === "cancelled" || b.status === "refunded");
  const loyaltyDone = past.length % 5;
  const spent = mine.reduce((sum, b) => sum + b.amountPaid, 0);
  const detailsBooking = mine.find((b) => b.id === detailsId);
  const detailsBarber = detailsBooking ? getBarber(detailsBooking.barberSlug) : undefined;
  const detailsService = detailsBarber?.services.find((s) => s.id === detailsBooking?.serviceId);

  const confirmCancellation = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelId);
      toast.success("Cita cancelada. El horario ya está disponible.");
      setCancelId(null);
      setDetailsId(null);
    } catch {
      toast.error("No se pudo cancelar la cita. Inténtalo otra vez.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">MY CHAIRS</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">My bookings</h1>

      {upcoming.length === 0 && waitlist.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-14 text-center">
          <CalendarX size={36} className="mx-auto text-muted-foreground" />
          <p className="mt-4 font-display text-xl font-bold">Nothing booked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your next great cut is one search away.
          </p>
          <Link
            to="/explore"
            search={{ q: "" }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
          >
            Find a pro <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {upcoming.map((b) => {
            const barber = getBarber(b.barberSlug);
            const service = barber?.services.find((s) => s.id === b.serviceId);
            if (!barber) return null;
            if (editingId === b.id) {
              return <BookingEditCard key={b.id} booking={b} onDone={() => setEditingId(null)} />;
            }
            return (
              <div
                key={b.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center"
              >
                <img
                  src={barber.avatar}
                  alt={`Portrait of ${barber.name}`}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="h-16 w-16 rounded-xl border border-gold/30 object-cover"
                />
                <div className="flex-1">
                  <p className="font-display font-bold">{service?.name ?? "Appointment"}</p>
                  <p className="text-sm text-muted-foreground">
                    {barber.name} · {barber.shop}, {barber.neighborhood}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gold">
                    {formatDateLong(b.dateISO)} · {slotLabel(b.time)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BellRing size={12} className="text-primary" /> Reminders: 24h email · 2h SMS
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right text-sm">
                    <p className="font-bold">${b.total}</p>
                    <p className="text-xs text-muted-foreground">
                      ${b.amountPaid} paid ({b.payType === "deposit" ? "deposit" : "full"})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailsId(b.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-gold transition-colors hover:bg-gold/20"
                    >
                      <Eye size={13} /> Ver detalles
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(b.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                    >
                      <Pencil size={13} /> Editar cita
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelId(b.id)}
                      className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Cancelar cita
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {waitlist.length > 0 && (
            <>
              <h2 className="pt-4 font-display text-lg font-bold">Waitlist</h2>
              {waitlist.map((w) => {
                const barber = getBarber(w.barberSlug);
                if (!barber) return null;
                return (
                  <div
                    key={w.id}
                    className="flex items-center gap-4 rounded-xl border border-dashed border-gold/40 bg-gold/5 p-5"
                  >
                    <Hourglass size={20} className="shrink-0 text-gold" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {barber.name} · {formatDateLong(w.dateISO)} · {slotLabel(w.time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You'll be promoted automatically if this slot opens.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        leaveWaitlist(w.id);
                        toast.info("Removed from waitlist");
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Leave
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {cancelled.length > 0 && (
            <>
              <h2 className="pt-4 font-display text-lg font-bold text-muted-foreground">Cancelled</h2>
              {cancelled.map((b) => {
                const barber = getBarber(b.barberSlug);
                const service = barber?.services.find((s) => s.id === b.serviceId);
                if (!barber) return null;
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-4 opacity-60">
                    <p className="text-sm">
                      {service?.name} with {barber.name} — {formatDateLong(b.dateISO)}
                    </p>
                    <Link
                      to="/book/$slug"
                      params={{ slug: barber.slug }}
                      search={{ service: b.serviceId, date: "", time: "" }}
                      className="flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
                    >
                      <CalendarPlus size={13} /> Rebook
                    </Link>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {detailsBooking && detailsBarber && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="booking-details-title">
          <div className="w-full max-w-lg rounded-t-xl border border-border bg-card p-6 shadow-2xl sm:rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Cita confirmada</p>
                <h2 id="booking-details-title" className="mt-1 font-display text-2xl font-bold">{detailsService?.name ?? "Cita"}</h2>
              </div>
              <button type="button" onClick={() => setDetailsId(null)} aria-label="Cerrar detalles" className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3"><img src={detailsBarber.avatar} alt={detailsBarber.name} className="h-12 w-12 rounded-lg object-cover" /><div><p className="font-bold">{detailsBarber.name}</p><p className="text-muted-foreground">{detailsBarber.shop}</p></div></div>
              <div className="flex gap-3 border-t border-border pt-4"><CalendarPlus size={18} className="text-gold" /><div><p className="font-semibold">{formatDateLong(detailsBooking.dateISO)} · {slotLabel(detailsBooking.time)}</p><p className="text-muted-foreground">Fecha y hora reservadas</p></div></div>
              <div className="flex gap-3"><MapPin size={18} className="text-gold" /><div><p className="font-semibold">{detailsBarber.shop}</p><p className="text-muted-foreground">{detailsBarber.neighborhood}</p></div></div>
              <div className="flex gap-3"><CreditCard size={18} className="text-gold" /><div><p className="font-semibold">${detailsBooking.total} total · ${detailsBooking.amountPaid} pagado</p><p className="capitalize text-muted-foreground">Método: {detailsBooking.payMethod ?? "No indicado"}</p></div></div>
              <div className="rounded-lg border border-border bg-background p-3"><p className="text-xs text-muted-foreground">Número de confirmación</p><p className="mt-1 break-all font-mono text-xs font-semibold">{detailsBooking.id}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setDetailsId(null); setEditingId(detailsBooking.id); }} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Pencil size={14} /> Editar cita</button>
              <button type="button" onClick={() => setCancelId(detailsBooking.id)} className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-bold text-destructive">Cancelar cita</button>
            </div>
          </div>
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="cancel-booking-title">
          <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-card p-6 shadow-2xl">
            <AlertTriangle size={28} className="text-destructive" />
            <h2 id="cancel-booking-title" className="mt-4 font-display text-xl font-bold">¿Cancelar esta cita?</h2>
            <p className="mt-2 text-sm text-muted-foreground">La cita pasará a cancelada y este horario quedará libre. Si aparece un pago registrado, quedará marcado para reembolso.</p>
            <div className="mt-6 flex gap-2">
              <button type="button" disabled={cancelling} onClick={() => void confirmCancellation()} className="rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-50">{cancelling ? "Cancelando…" : "Sí, cancelar cita"}</button>
              <button type="button" disabled={cancelling} onClick={() => setCancelId(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">No, volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuardedBookingsPage() {
  return (
    <AuthGate title="Tus citas">
      <BookingsPage />
    </AuthGate>
  );
}
