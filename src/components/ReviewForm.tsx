import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useReviews } from "@/lib/review-store";

export function ReviewForm({
  bookingId,
  barberSlug,
  authorName,
  serviceName,
  onDone,
}: {
  bookingId: string | null;
  barberSlug: string;
  authorName: string;
  serviceName: string;
  onDone?: () => void;
}) {
  const { addReview } = useReviews();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
      <p className="font-display text-sm font-bold">¿Cómo te fue? Deja tu reseña</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrellas`}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star size={22} className={n <= rating ? "fill-gold text-gold" : "text-muted-foreground"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Cuenta cómo quedó el corte, el trato, el local…"
        className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await addReview({ bookingId, barberSlug, authorName, serviceName, rating, comment: comment.trim() });
            toast.success("¡Gracias! Tu reseña ya está publicada.");
            onDone?.();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "No se pudo publicar la reseña.");
          } finally {
            setSaving(false);
          }
        }}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/85 disabled:opacity-50"
      >
        Publicar reseña
      </button>
    </div>
  );
}
