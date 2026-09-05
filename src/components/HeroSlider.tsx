import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PlayCircle, Settings2 } from "lucide-react";
import { useSite } from "@/lib/site-store";

export function HeroSlider() {
  const { slides } = useSite();
  const active = slides.filter((s) => s.active);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (active.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % active.length), 6500);
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0) return null;
  const slide = active[Math.min(i, active.length - 1)];
  if (!slide) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card">
        <div className="relative h-44 w-full sm:h-56">
          {slide.videoUrl ? (
            <video
              key={slide.id}
              src={slide.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-1.5 p-5 sm:p-8">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-gold">
              <PlayCircle size={12} /> DESTACADO
            </p>
            <h2 className="max-w-md font-display text-xl font-extrabold leading-tight sm:text-2xl">
              {slide.title}
            </h2>
            <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">{slide.subtitle}</p>
            {slide.ctaLabel && slide.ctaUrl && (
              <a
                href={slide.ctaUrl}
                className="mt-2 w-fit rounded-lg bg-gold px-4 py-2 text-xs font-bold text-gold-foreground hover:bg-gold/90"
              >
                {slide.ctaLabel}
              </a>
            )}
          </div>

          <Link
            to="/admin"
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground backdrop-blur hover:text-gold"
          >
            <Settings2 size={12} /> Admin
          </Link>

          {active.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {active.map((s, idx) => (
                <button
                  key={s.id}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? "w-6 bg-gold" : "w-1.5 bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
