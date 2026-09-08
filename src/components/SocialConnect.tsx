import { Instagram, Youtube, Facebook, Music2, Globe, ExternalLink } from "lucide-react";
import type { Socials } from "@/lib/data/pro-pages";

export const SOCIAL_META = [
  { key: "tiktok", label: "TikTok", icon: Music2, color: "#25f4ee" },
  { key: "instagram", label: "Instagram", icon: Instagram, color: "#e1306c" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#ff0000" },
  { key: "facebook", label: "Facebook", icon: Facebook, color: "#1877f2" },
  { key: "website", label: "Web", icon: Globe, color: "#d4af37" },
] as const;

function handleFromUrl(url: string) {
  const clean = url.replace(/\/+$/, "");
  const last = clean.split("/").pop() ?? "";
  return last.startsWith("@") ? last : last ? `@${last}` : "";
}

/** Pills simples de redes conectadas */
export function SocialPills({ socials }: { socials: Socials }) {
  const items = SOCIAL_META.filter((s) => socials[s.key]);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, label, icon: Icon }) => (
        <a
          key={key}
          href={socials[key]}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-gold"
        >
          <Icon size={14} /> {label}
        </a>
      ))}
    </div>
  );
}

/** Tarjetas de redes conectadas con el @ y acceso directo */
export function SocialConnect({
  socials,
  title = "Redes conectadas",
}: {
  socials: Socials;
  title?: string;
}) {
  const items = SOCIAL_META.filter((s) => socials[s.key]);

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no hay redes conectadas. Agrega TikTok, Instagram, YouTube o Facebook desde el editor.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map(({ key, label, icon: Icon, color }) => (
            <a
              key={key}
              href={socials[key]}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-gold/50"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: `${color}22`, color }}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {handleFromUrl(socials[key]) || socials[key]}
                </span>
              </span>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-gold" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
