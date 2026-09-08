import { Link } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Star } from "lucide-react";
import { useBookings } from "@/lib/booking-store";

export function Header() {
  const { bookings } = useBookings();
  const upcoming = bookings.filter((b) => b.status === "upcoming").length;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo-mark.png"
            alt="GILT"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
          />
          <span className="font-display text-xl font-bold tracking-[0.18em] text-foreground">
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
            <span className="hidden sm:inline">For Pros</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
