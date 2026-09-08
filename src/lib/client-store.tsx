import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_CLIENT_PROFILES, type ClientProfile } from "@/lib/data/client-profiles";

interface ClientStore {
  hydrated: boolean;
  profiles: ClientProfile[];
  getProfile: (handle: string) => ClientProfile | undefined;
  saveProfile: (profile: ClientProfile) => void;
  removeProfile: (handle: string) => void;
}

const KEY = "gilt-client-profiles-v1";
const Ctx = createContext<ClientStore | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [custom, setCustom] = useState<ClientProfile[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCustom(JSON.parse(raw) as ClientProfile[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(custom));
  }, [custom, hydrated]);

  const profiles: ClientProfile[] = [
    ...custom,
    ...SEED_CLIENT_PROFILES.filter((s) => !custom.some((c) => c.handle === s.handle)),
  ];

  const store: ClientStore = {
    hydrated,
    profiles,
    getProfile: (handle) => profiles.find((p) => p.handle === handle),
    saveProfile: (profile) =>
      setCustom((prev) => [profile, ...prev.filter((p) => p.handle !== profile.handle)]),
    removeProfile: (handle) => setCustom((prev) => prev.filter((p) => p.handle !== handle)),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useClients(): ClientStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClients must be used inside ClientProvider");
  return ctx;
}
