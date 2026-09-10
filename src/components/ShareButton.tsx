import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({
  title,
  path,
  label = "Compartir",
  className = "",
}: {
  title: string;
  path: string;
  label?: string;
  className?: string;
}) {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado. Ya lo puedes pegar donde quieras.");
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold hover:text-gold ${className}`}
    >
      <Share2 size={14} /> {label}
    </button>
  );
}
