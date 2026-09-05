import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { BARBERS, CATEGORIES, type ServiceCategory } from "@/lib/data/barbers";
import { BarberCard, priceTierLabel } from "@/components/BarberCard";

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({
    meta: [
      { title: "Explore Barbers & Salons — GILT" },
      {
        name: "description",
        content:
          "Browse verified barbers and salons by service, price and rating. Live availability, real portfolios and honest reviews.",
      },
      { property: "og:title", content: "Explore Barbers & Salons — GILT" },
      {
        property: "og:description",
        content: "Browse verified barbers and salons by service, price and rating.",
      },
    ],
  }),
  component: ExplorePage,
});

type Sort = "rating" | "distance" | "priceAsc" | "priceDesc";

function ExplorePage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const [category, setCategory] = useState<ServiceCategory | "All">("All");
  const [tier, setTier] = useState<0 | 1 | 2 | 3>(0);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("rating");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = BARBERS.filter((b) => {
      if (category !== "All" && !b.services.some((s) => s.category === category)) return false;
      if (tier !== 0 && b.priceTier !== tier) return false;
      if (b.rating < minRating) return false;
      if (!needle) return true;
      return (
        b.name.toLowerCase().includes(needle) ||
        b.shop.toLowerCase().includes(needle) ||
        b.neighborhood.toLowerCase().includes(needle) ||
        b.specialties.some((sp) => sp.toLowerCase().includes(needle)) ||
        b.services.some((s) => s.name.toLowerCase().includes(needle) || s.category.toLowerCase().includes(needle))
      );
    });
    const minPrice = (b: (typeof BARBERS)[number]) => Math.min(...b.services.map((s) => s.price));
    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "distance") return a.distanceMi - b.distanceMi;
      if (sort === "priceAsc") return minPrice(a) - minPrice(b);
      return minPrice(b) - minPrice(a);
    });
    return list;
  }, [query, category, tier, minRating, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">EXPLORE</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold">Find your next chair</h1>

      {/* Search + sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, shop, service or neighborhood…"
            className="w-full rounded-xl border border-input bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground focus:border-gold focus:outline-none"
        >
          <option value="rating">Top rated</option>
          <option value="distance">Nearest</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={15} className="text-muted-foreground" />
        {(["All", ...CATEGORIES.map((c) => c.name)] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              category === c
                ? "border-gold bg-gold/15 text-gold"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {([0, 1, 2, 3] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              tier === t
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === 0 ? "Any price" : priceTierLabel(t as 1 | 2 | 3)}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground focus:border-gold focus:outline-none"
        >
          <option value={0}>Any rating</option>
          <option value={4.9}>4.9+</option>
          <option value={4.95}>4.95+</option>
        </select>
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "pro" : "pros"} available
      </p>
      {results.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-display text-lg font-bold">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different service or widen your filters.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((b) => (
            <BarberCard key={b.slug} barber={b} />
          ))}
        </div>
      )}
    </div>
  );
}
