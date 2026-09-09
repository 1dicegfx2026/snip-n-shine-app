import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGate({ title, children }: { title: string; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Lock size={22} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entra con tu cuenta para que todo quede guardado y lo puedas ver desde cualquier teléfono.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85"
        >
          Entrar o crear cuenta
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
