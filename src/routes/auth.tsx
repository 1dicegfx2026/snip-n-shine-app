import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar a GILT — Cuenta de cliente y barbero" },
      {
        name: "description",
        content:
          "Crea tu cuenta GILT para reservar cortes, guardar tus citas y publicar tu página de barbero.",
      },
      { property: "og:title", content: "Entrar a GILT" },
      { property: "og:description", content: "Crea tu cuenta para reservar y manejar tus citas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      toast.error("Pon tu correo y una clave de 6 caracteres o más.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya puedes reservar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Bienvenido de vuelta.");
      }
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos entrar.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("No pudimos entrar con Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <p className="text-xs font-bold tracking-[0.25em] text-gold">GILT</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">
        {mode === "in" ? "Entra a tu cuenta" : "Crea tu cuenta"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu cuenta guarda tus citas, tus pagos y tu página — la ves desde cualquier teléfono.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6">
        <button
          type="button"
          onClick={google}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold hover:bg-accent"
        >
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o con correo <span className="h-px flex-1 bg-border" />
        </div>

        {mode === "up" && (
          <Field label="Tu nombre" value={name} onChange={setName} placeholder="Jeline" />
        )}
        <Field label="Correo" value={email} onChange={setEmail} placeholder="tu@correo.com" type="email" />
        <Field label="Clave" value={password} onChange={setPassword} placeholder="••••••" type="password" />

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-display text-sm font-bold text-primary-foreground hover:bg-primary/85 disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "in" ? <LogIn size={16} /> : <UserPlus size={16} />}
          {mode === "in" ? "Entrar" : "Crear cuenta"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-gold"
        >
          {mode === "in" ? "¿No tienes cuenta? Créala aquí" : "¿Ya tienes cuenta? Entra aquí"}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ¿Eres barbero?{" "}
        <Link to="/pro/new" className="font-semibold text-gold">
          Crea tu página
        </Link>{" "}
        después de entrar.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}
