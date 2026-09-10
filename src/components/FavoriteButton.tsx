import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useReviews } from "@/lib/review-store";

export function FavoriteButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useReviews();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={async () => {
        try {
          await toggleFavorite(slug);
          toast.success(active ? "Quitado de favoritos." : "Guardado en favoritos.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "No se pudo guardar.");
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "border-gold bg-gold/10 text-gold"
          : "border-border text-muted-foreground hover:border-gold hover:text-gold"
      } ${className}`}
    >
      <Heart size={14} className={active ? "fill-gold" : ""} />
      {active ? "Favorito" : "Guardar"}
    </button>
  );
}
