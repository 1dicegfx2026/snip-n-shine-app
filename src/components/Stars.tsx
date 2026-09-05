import { Star, StarHalf } from "lucide-react";

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <Star key={i} size={size} fill="currentColor" strokeWidth={0} />;
        if (i === full && half) return <StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />;
        return <Star key={i} size={size} className="text-muted-foreground/40" />;
      })}
    </span>
  );
}
