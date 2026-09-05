import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, BadgeCheck, Clock, CalendarPlus, Scissors } from "lucide-react";
import { getBarber, getSlots, nextNDates, formatDateLong } from "@/lib/data/barbers";
import { Stars } from "@/components/Stars";
import { useBookings } from "@/lib/booking-store";
import { toast } from "sonner";

export const Route = createFileRoute("/barber/$slug")({
  loader: ({ params }) => {
    const barber = getBarber(params.slug);
    if (!barber) throw notFound();
    return barber;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Barber"} — GILT` },
      {
        name: "description",
        content: loaderData
          ? `Book ${loaderData.name} at ${loaderData.shop}, ${loaderData.neighborhood}. ${loaderData.rating}★ from ${loaderData.reviewCount} reviews.`
          : "Book a top barber on GILT.",
      },
      { property: "og:title", content: `${loaderData?.name ?? "Barber"} — GILT` },
      {
        property: "og:description",
        content: loaderData ? loaderData.tagline : "Book a top barber on GILT.",
      },
    ],
  }),
  component: BarberProfile,
});

function BarberProfile() {
  const barber = Route.useLoaderData();
  const { waitlist, joinWaitlist, leaveWaitlist, bookedTimesFor } = useBookings();
  const days = nextNDates(3);
  const dist = [62, 26, 8, 3, 1]; // 5★ → 1★ distribution %

  const isWaitlisted = (dateISO: string, time: string) =>
    waitlist.some((w) => w.barberSlug === barber.slug && w.dateISO === dateISO && w.time === time);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <img
          src={barber.avatar}
          alt={`Portrait of ${barber.name}`}
          width={512}
          height={512}
          className="h-40 w-40 rounded-2xl border border-gold/30 object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{barber.name}</h1>
            <BadgeCheck size={24} className="text-primary" />
          </div>
          <p className="mt-1 text-lg text-gold">{barber.shop}</p>
          <p className="mt-2 max-w-xl text-muted-foreground">{barber.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <Stars rating={barber.rating} size={16} />
              <b>{barber.rating.toFixed(2)}</b>
              <span className="text-muted-foreground">({barber.reviewCount} reviews)</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={14} /> {barber.location}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={14} /> {barber.yearsExperience} yrs experience
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {barber.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {/* Portfolio */}
          <section>
            <h2 className="font-display text-2xl font-bold">Portfolio</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {barber.portfolio.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Work by ${barber.name}`}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="aspect-[3/2] w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="font-display text-2xl font-bold">Services & pricing</h2>
            <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {barber.services.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.category} · {s.durationMin} min
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg font-bold text-gold">${s.price}</span>
                    <Link
                      to="/book/$slug"
                      params={{ slug: barber.slug }}
                      search={{ service: s.id }}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/85"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="font-display text-2xl font-bold">Reviews</h2>
            <div className="mt-4 grid gap-6 rounded-xl border border-border bg-card p-6 sm:grid-cols-[180px_1fr]">
              <div className="text-center sm:text-left">
                <p className="font-display text-5xl font-extrabold text-gold">
                  {barber.rating.toFixed(2)}
                </p>
                <Stars rating={barber.rating} size={16} />
                <p className="mt-1 text-xs text-muted-foreground">{barber.reviewCount} reviews</p>
              </div>
              <div className="space-y-1.5">
                {dist.map((pct, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-6 text-muted-foreground">{5 - i}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {barber.reviews.map((r) => (
                <article key={r.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-deep font-display text-sm font-bold text-primary">
                        {r.author.charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.service} · {r.date}
                        </p>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Availability sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-gold/30 bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Scissors size={17} className="text-gold" /> Live availability
            </h2>
            <div className="mt-4 space-y-5">
              {days.map((d) => {
                const slots = getSlots(barber, d.iso, bookedTimesFor(barber.slug, d.iso));
                const open = slots.filter((s) => s.status === "available");
                return (
                  <div key={d.iso}>
                    <p className="text-sm font-semibold">
                      {formatDateLong(d.iso)}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {open.length} open
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {slots.slice(0, 8).map((s) =>
                        s.status === "available" ? (
                          <Link
                            key={s.time}
                            to="/book/$slug"
                            params={{ slug: barber.slug }}
                            search={{ service: "", date: d.iso, time: s.time }}
                            className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/25"
                          >
                            {s.label}
                          </Link>
                        ) : (
                          <button
                            key={s.time}
                            onClick={() => {
                              if (isWaitlisted(d.iso, s.time)) {
                                const entry = waitlist.find(
                                  (w) => w.barberSlug === barber.slug && w.dateISO === d.iso && w.time === s.time,
                                );
                                if (entry) leaveWaitlist(entry.id);
                                toast.info("Removed from waitlist");
                              } else {
                                joinWaitlist({ barberSlug: barber.slug, dateISO: d.iso, time: s.time });
                                toast.success("You're on the waitlist — we'll promote you if it opens.");
                              }
                            }}
                            title={isWaitlisted(d.iso, s.time) ? "On waitlist — tap to leave" : "Taken — tap to join waitlist"}
                            className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                              isWaitlisted(d.iso, s.time)
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-border bg-muted text-muted-foreground line-through hover:text-gold"
                            }`}
                          >
                            {s.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              to="/book/$slug"
              params={{ slug: barber.slug }}
              search={{ service: "" }}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 font-display text-sm font-bold text-gold-foreground transition-colors hover:bg-gold/90"
            >
              <CalendarPlus size={16} /> Book an appointment
            </Link>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Taken slots can be waitlisted — tap one to join.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
