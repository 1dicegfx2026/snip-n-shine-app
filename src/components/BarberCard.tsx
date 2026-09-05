import { Link } from "@tanstack/react-router";
import { MapPin, BadgeCheck, Clock } from "lucide-react";
import type { Barber } from "@/lib/data/barbers";
import { Stars } from "./Stars";

export function priceTierLabel(tier: 1 | 2 | 3) {
  return tier === 1 ? "$" : tier === 2 ? "$$" : "$$$";
}

export function BarberCard({ barber }: { barber: Barber }) {
  const from = Math.min(...barber.services.map((s) => s.price));
  return (
    <Link
      to="/barber/$slug"
      params={{ slug: barber.slug }}
      className="card-luxe group block overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={barber.avatar}
          alt={`Portrait of ${barber.name}`}
          loading="lazy"
          width={512}
          height={512}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-gold/40 bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wide text-gold backdrop-blur">
          {barber.type === "barber" ? "BARBER" : "SALON"}
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-semibold text-white">
          <Clock size={12} className="text-gold" /> Next: {barber.nextAvailableHint}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-base font-bold leading-tight">{barber.name}</h3>
          <BadgeCheck size={16} className="shrink-0 text-primary" />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {barber.shop} · {barber.neighborhood}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Stars rating={barber.rating} />
          <span className="text-xs font-semibold text-foreground">{barber.rating.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">({barber.reviewCount})</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {barber.distanceMi} mi
          </span>
          <span className="font-semibold text-foreground">
            from <span className="text-gold">${from}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
