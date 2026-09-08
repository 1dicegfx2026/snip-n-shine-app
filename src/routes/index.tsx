import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Scissors,
  Zap,
  Brush,
  Crown,
  Palette,
  Slice,
  Hand,
  type LucideIcon,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder.jpg";
import { BARBERS, CATEGORIES } from "@/lib/data/barbers";
import { CELEBRITIES, formatFollowers } from "@/lib/data/celebrities";
import { BarberCard } from "@/components/BarberCard";
import { HeroSlider } from "@/components/HeroSlider";
import { SponsorBanner } from "@/components/SponsorBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GILT — Book Top Barbers & Salons Instantly" },
      {
        name: "description",
        content:
          "Discover elite barbers and salons near you. Browse portfolios, read reviews, and book real-time slots with a deposit — only on GILT.",
      },
      { property: "og:title", content: "GILT — Book Top Barbers & Salons Instantly" },
      {
        property: "og:description",
        content: "Discover elite barbers and salons near you. Real-time booking, portfolios and reviews.",
      },
    ],
  }),
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Cuts: Scissors,
  Fades: Zap,
  Beard: Brush,
  Braids: Crown,
  Color: Palette,
  Shave: Slice,
  Nails: Hand,
  Styling: Sparkles,
};

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const featured = [...BARBERS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div>
      <HeroSlider />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Luxury barbershop interior with emerald velvet chairs and brass fixtures"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/50 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-gold backdrop-blur">
              <Sparkles size={13} /> THE LUXURY BOOKING STANDARD
            </p>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your chair is <span className="text-gold-gradient">waiting.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Book the city's most sought-after barbers and stylists in seconds. Real portfolios,
              honest reviews, live availability — and never a waiting room.
            </p>

            <form
              className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/explore", search: { q: query } });
              }}
            >
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fade, braids, balayage, beard sculpt…"
                  className="h-13 w-full rounded-xl border border-input bg-card/90 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Find your pro <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Verified pros only
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-primary" /> Live availability
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" /> New York City
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">SERVICES</p>
            <h2 className="mt-2 font-display text-3xl font-bold">What are we booking today?</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.name] ?? Scissors;
            return (
            <Link
              key={c.name}
              to="/explore"
              search={{ q: c.name.toLowerCase() }}
              className="card-luxe p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Icon size={20} />
              </span>
              <p className="mt-3 font-display font-bold">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
            </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">TOP RATED</p>
            <h2 className="mt-2 font-display text-3xl font-bold">The most booked chairs in NYC</h2>
          </div>
          <Link
            to="/explore"
            search={{ q: "" }}
            className="hidden items-center gap-1.5 text-sm font-semibold text-gold hover:underline sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((b) => (
            <BarberCard key={b.slug} barber={b} />
          ))}
        </div>
      </section>

      {/* Celebrity artists */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">GILT CELEBRITY</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Appointment directo con los artistas</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Meet & greets, sesiones y cortes en cámara con las figuras de la cultura. Cada uno con
              su propio perfil, a su estilo.
            </p>
          </div>
          <Link
            to="/celebrities"
            className="flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
          >
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {CELEBRITIES.map((c) => (
            <Link key={c.slug} to="/celebrity/$slug" params={{ slug: c.slug }} className="card-luxe overflow-hidden">
              <img src={c.avatar} alt={c.name} loading="lazy" className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-lg font-bold">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.role} · {formatFollowers(c.followers)} fans
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs font-bold tracking-[0.25em] text-gold">HOW GILT WORKS</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Three steps to sharp</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Discover",
                text: "Browse verified pros by craft, price and neighborhood. Every portfolio is real work, every review is from a real client.",
              },
              {
                n: "02",
                title: "Book in seconds",
                text: "Pick a live slot, secure it with a small deposit, and get instant confirmation with smart reminders before your visit.",
              },
              {
                n: "03",
                title: "Walk in sharp",
                text: "Your chair is reserved and waiting. Fully booked? Join the waitlist and get promoted automatically when slots open.",
              },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-background p-6">
                <span className="font-display text-4xl font-extrabold text-gold/30">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor + comunidad + clases */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <SponsorBanner />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            to="/community"
            className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-gold/50"
          >
            <p className="text-xs font-bold tracking-[0.25em] text-gold">COMUNIDAD</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Tu propia página como cliente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Guarda tus looks por categoría, conecta tus redes y enséñale al barbero justo lo que
              quieres antes de sentarte.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold">
              Ver la comunidad <ArrowRight size={15} />
            </span>
          </Link>
          <Link
            to="/classes"
            className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-gold/50"
          >
            <p className="text-xs font-bold tracking-[0.25em] text-gold">CLASES EN VIVO</p>
            <h3 className="mt-2 font-display text-2xl font-bold">Aprende del que está cortando</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fades, navaja, trenzas y color en vivo con los mejores pros. Pagas por clase y recibes
              el enlace.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold">
              Ver clases <ArrowRight size={15} />
            </span>
          </Link>
        </div>
      </section>

      {/* Founder / creator */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-gold/30">
            <img
              src={founderImg}
              alt="Founder and creator of GILT wearing the GILT logo jacket"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full border border-gold/40 bg-background/70 px-3 py-1 text-xs font-bold tracking-[0.2em] text-gold backdrop-blur">
              FOUNDER
            </span>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-gold">EL CREADOR</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Built by someone who lives the chair
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              GILT nació en la barbería, no en una oficina. La idea es simple: darle a cada barbero
              y estilista su propia página, sus clientes, sus clases y su dinero — sin que una app
              se quede con el control de su nombre.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {[
                "Página personal para cada pro, con su trabajo por categorías",
                "Clases en vivo y clientes que se traen de otras plataformas",
                "Sponsors, afiliados y membresías que pagan de verdad",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              to="/pro/new"
              search={{ edit: "" }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gold/40 px-6 py-3 font-display text-sm font-bold text-gold transition-colors hover:bg-gold/10"
            >
              Crear mi página <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pro CTA */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-emerald-deep via-card to-background p-8 sm:p-12">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-[0.25em] text-gold">BUSINESS TOOLS</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Fill your chair. Keep your no-shows at zero.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Deposit-protected bookings, automatic reminders, a waitlist that fills cancellations,
              and a dashboard that runs your day for you.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-display text-sm font-bold text-gold-foreground transition-colors hover:bg-gold/90"
            >
              Open business dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
