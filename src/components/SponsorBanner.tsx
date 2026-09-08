import { ExternalLink } from "lucide-react";
import { SPONSORS, FEATURED_SPONSOR, type Sponsor } from "@/lib/data/sponsors";

function SponsorLink({ sponsor, children, className }: { sponsor: Sponsor; children: React.ReactNode; className?: string }) {
  const external = sponsor.url.startsWith("http");
  return (
    <a
      href={sponsor.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
      className={className}
    >
      {children}
    </a>
  );
}

/** Banner ancho, para home / clases / checkout */
export function SponsorBanner({ sponsor = FEATURED_SPONSOR }: { sponsor?: Sponsor }) {
  return (
    <SponsorLink
      sponsor={sponsor}
      className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-transparent p-4 transition-colors hover:border-gold/60 sm:p-5"
    >
      <img
        src={sponsor.imageUrl}
        alt={sponsor.brand}
        loading="lazy"
        className="hidden h-20 w-32 shrink-0 rounded-xl object-cover sm:block"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-[0.25em] text-gold">SPONSOR</p>
        <p className="mt-1 font-display text-lg font-bold">{sponsor.brand}</p>
        <p className="truncate text-sm text-muted-foreground">{sponsor.tagline}</p>
        <p className="mt-1 text-xs font-semibold text-gold">{sponsor.offer}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 font-display text-xs font-bold text-gold-foreground sm:inline-flex">
        Ver <ExternalLink size={12} />
      </span>
    </SponsorLink>
  );
}

/** Tira de sponsors, para pie de páginas y directorios */
export function SponsorStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SPONSORS.map((s) => (
        <SponsorLink
          key={s.id}
          sponsor={s}
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/50"
        >
          <p className="text-[10px] font-bold tracking-[0.25em] text-gold">SPONSOR</p>
          <p className="mt-1 font-display font-bold">{s.brand}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.tagline}</p>
        </SponsorLink>
      ))}
    </div>
  );
}
