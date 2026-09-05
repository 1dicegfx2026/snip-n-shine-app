import { createFileRoute, Link } from "@tanstack/react-router";
import { DollarSign, CalendarCheck, Star, Hourglass, TrendingUp } from "lucide-react";
import { getBarber, nextNDates, formatDateLong } from "@/lib/data/barbers";
import { useBookings } from "@/lib/booking-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Pro Dashboard — GILT" },
      { name: "description", content: "Run your chair like a business: schedule, deposits, waitlist and reviews in one place." },
      { property: "og:title", content: "Pro Dashboard — GILT" },
      { property: "og:description", content: "Run your chair like a business with GILT." },
    ],
  }),
  component: DashboardPage,
});

const DEMO_TODAY = [
  { time: "9:00 AM", client: "Devon W.", service: "Signature Skin Fade", status: "done" },
  { time: "10:30 AM", client: "Chris P.", service: "The Full Works", status: "done" },
  { time: "12:00 PM", client: "Andre L.", service: "Beard Sculpt & Hot Towel", status: "next" },
  { time: "2:30 PM", client: "Marcus H.", service: "Signature Skin Fade", status: "upcoming" },
  { time: "4:00 PM", client: "Sam K.", service: "Executive Cut & Style", status: "upcoming" },
];

const DEMO_WAITLIST = [
  { client: "Jordan R.", wants: "Today after 5 PM" },
  { client: "Trey B.", wants: "Tomorrow morning" },
  { client: "Isaiah F.", wants: "Any fade slot this week" },
];

function DashboardPage() {
  const barber = getBarber("marcus-cole")!;
  const { bookings, waitlist } = useBookings();
  const days = nextNDates(1);
  const todayISO = days[0]?.iso ?? "";

  const myBookingsToday = bookings.filter(
    (b) => b.barberSlug === barber.slug && b.dateISO === todayISO && b.status === "upcoming",
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={barber.avatar}
            alt={`Portrait of ${barber.name}`}
            width={512}
            height={512}
            className="h-14 w-14 rounded-xl border border-gold/30 object-cover"
          />
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">PRO DASHBOARD</p>
            <h1 className="font-display text-2xl font-extrabold">
              Good day, {barber.name.split(" ")[0]}
            </h1>
          </div>
        </div>
        <Link
          to="/barber/$slug"
          params={{ slug: barber.slug }}
          className="self-start rounded-xl border border-gold/40 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 sm:self-auto"
        >
          View public profile
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: "Revenue this week", value: "$2,340", sub: "+12% vs last week" },
          { icon: CalendarCheck, label: "Bookings this week", value: "31", sub: "92% chair occupancy" },
          { icon: Star, label: "Rating", value: barber.rating.toFixed(2), sub: `${barber.reviewCount} reviews` },
          { icon: Hourglass, label: "On waitlist", value: String(DEMO_WAITLIST.length + waitlist.filter((w) => w.barberSlug === barber.slug).length), sub: "auto-fill enabled" },
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
        {/* Today's schedule */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">
            Today's schedule — {formatDateLong(todayISO)}
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
                    a.status === "done"
                      ? "bg-muted text-muted-foreground"
                      : a.status === "next"
                        ? "bg-primary/15 text-primary"
                        : "bg-gold/10 text-gold"
                  }`}
                >
                  {a.status === "done" ? "Completed" : a.status === "next" ? "Up next" : "Booked"}
                </span>
              </div>
            ))}
            {myBookingsToday.map((b) => {
              const service = barber.services.find((s) => s.id === b.serviceId);
              return (
                <div key={b.id} className="flex items-center gap-4 py-3.5">
                  <span className="w-20 shrink-0 font-display text-sm font-bold text-gold">{b.time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{service?.name} (new booking)</p>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary">
                    Booked
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Waitlist */}
        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Waitlist</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              When a slot opens, the next guest is promoted and notified automatically.
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
                      <p className="text-sm font-semibold">Guest request</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateLong(w.dateISO)} · {w.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-xl border border-gold/30 bg-gradient-to-br from-emerald-deep to-card p-5">
            <h2 className="font-display text-lg font-bold">Deposit protection</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every booking holds a 25% deposit. No-shows this month: <b className="text-gold">0</b>.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
