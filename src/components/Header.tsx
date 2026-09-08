import { Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, LayoutDashboard, Star } from "lucide-react";
import { useBookings } from "@/lib/booking-store";

export function Header() {
  const { bookings } = useBookings();
  const upcoming = bookings.filter((b) => b.status === "upcoming").length;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo-mark.png"
            alt="GILT"
            className="h-12 w-auto object-contain"
          />
          <span className="font-display text-2xl font-bold tracking-[0.18em] text-foreground">
            GILT
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-2">
          <Link
            to="/explore"
            search={{ q: "" }}
            className="rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            activeProps={{ className: "text-gold hover:text-gold" }}
          >
            Explore
          </Link>
          <Link
            to="/pros"
            className="rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            activeProps={{ className: "text-gold hover:text-gold" }}
          >
            Pros
          </Link>
          <Link
            to="/celebrities"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            activeProps={{ className: "text-gold hover:text-gold" }}
          >
            <Star size={16} />
            <span className="hidden sm:inline">Celebrity</span>
          </Link>

          <Link
            to="/bookings"
            className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            activeProps={{ className: "text-gold hover:text-gold" }}
          >
            <CalendarDays size={16} />
            <span className="hidden sm:inline">My Bookings</span>
            {upcoming > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {upcoming}
              </span>
            )}
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:px-3"
            activeProps={{ className: "text-gold hover:text-gold" }}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Business</span>
          </Link>
        </nav>

        <a
          href="https://www.sharp47.com/products/sharp-47-clipper-and-trimmers"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold transition-colors hover:bg-gold/20 md:flex"
        >
          Sponsor <span className="text-foreground">Sharp47</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
}
