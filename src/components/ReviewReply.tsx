import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { useReviews } from "@/lib/review-store";
import { usePros } from "@/lib/pro-store";
import { useAdmin } from "@/lib/admin";

export function ReviewReply({
  reviewId,
  barberSlug,
  reply,
  replyAt,
  barberName,
}: {
  reviewId: string;
  barberSlug: string;
  reply: string;
  replyAt: number | null;
  barberName: string;
}) {
  const { replyToReview } = useReviews();
  const { ownsPage } = usePros();
  const admin = useAdmin();
  const [text, setText] = useState(reply);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const canReply = ownsPage(barberSlug) || admin.canEdit;

  const save = async () => {
    setSaving(true);
    try {
      await replyToReview(reviewId, text.trim());
      toast.success("Respuesta publicada.");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar la respuesta.");
    } finally {
      setSaving(false);
    }
  };

  if (reply && !open) {
    return (
      <div className="mt-3 rounded-lg border-l-2 border-gold bg-background/60 p-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-gold">
          <CornerDownRight size={12} /> Respuesta de {barberName}
          {replyAt ? ` · ${new Date(replyAt).toLocaleDateString()}` : ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{reply}</p>
        {canReply && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-2 text-xs font-semibold text-gold hover:underline"
          >
            Editar respuesta
          </button>
        )}
      </div>
    );
  }

  if (!canReply) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold hover:text-gold"
      >
        <CornerDownRight size={12} /> Responder
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Gracias por venir, nos vemos en el próximo corte…"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Publicar respuesta"}
        </button>
        <button
          type="button"
          onClick={() => {
            setText(reply);
            setOpen(false);
          }}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
