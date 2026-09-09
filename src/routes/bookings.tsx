import { AuthGate } from "@/components/AuthGate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarX, BellRing, Hourglass, CalendarPlus, ArrowRight } from "lucide-react";
import { getBarber, formatDateLong } from "@/lib/data/barbers";
import { useBookings } from "@/lib/booking-store";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

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

function BookingsPage() {
  const { bookings, waitlist, cancelBooking, leaveWaitlist } = useBookings();
  const { user } = useAuth();
  const mine = bookings.filter((b) => b.clientId === user?.id);
  const upcoming = mine.filter((b) => b.status === "upcoming");
  const cancelled = mine.filter((b) => b.status === "cancelled");

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
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right text-sm">
                    <p className="font-bold">${b.total}</p>
                    <p className="text-xs text-muted-foreground">
                      ${b.amountPaid} paid ({b.payType === "deposit" ? "deposit" : "full"})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      cancelBooking(b.id);
                      toast.info("Booking cancelled — the slot is now open to others.");
                    }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    Cancel
                  </button>
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
