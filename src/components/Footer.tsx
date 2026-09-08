import { Link } from "@tanstack/react-router";
import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-gold-foreground">
                <Scissors size={15} strokeWidth={2.4} />
              </span>
              <span className="font-display text-lg font-bold tracking-[0.18em]">GILT</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              The luxury way to book the best barbers and salons in your city. Sharp looks, zero
              waiting rooms.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="font-display font-semibold text-foreground">Clients</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link to="/explore" search={{ q: "" }} className="hover:text-gold">Find a barber</Link></li>
                <li><Link to="/bookings" className="hover:text-gold">My bookings</Link></li>
                <li><Link to="/celebrities" className="hover:text-gold">Artistas celebrity</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">Professionals</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link to="/pro/new" search={{ edit: "" }} className="hover:text-gold">Crear mi página</Link></li>
                <li><Link to="/pros" className="hover:text-gold">Páginas de pros</Link></li>
                <li><Link to="/pricing" className="hover:text-gold">Membresías</Link></li>
                <li><Link to="/dashboard" className="hover:text-gold">Business dashboard</Link></li>
                <li><Link to="/celebrity/new" className="hover:text-gold">Crear perfil de artista</Link></li>
                <li><Link to="/admin" className="hover:text-gold">Admin & video</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-display font-semibold text-foreground">Partners</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link to="/affiliates" className="hover:text-gold">Afiliados</Link></li>
                <li><Link to="/sponsors" className="hover:text-gold">Sponsors</Link></li>
                <li><span className="cursor-pointer hover:text-gold">Press</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 hairline-gold" />
        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 GILT Grooming Co. Crafted for people who take their chair seriously.
        </p>
      </div>
    </footer>
  );
}
