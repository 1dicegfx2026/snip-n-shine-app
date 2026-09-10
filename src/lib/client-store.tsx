import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_CLIENT_PROFILES, type ClientProfile } from "@/lib/data/client-profiles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ClientStore {
  hydrated: boolean;
  profiles: ClientProfile[];
  myProfiles: ClientProfile[];
  getProfile: (handle: string) => ClientProfile | undefined;
  saveProfile: (profile: ClientProfile) => Promise<void>;
  removeProfile: (handle: string) => Promise<void>;
}

const Ctx = createContext<ClientStore | null>(null);

interface Row {
  handle: string;
  owner_id: string;
  data: ClientProfile;
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("client_profiles")
      .select("handle, owner_id, data")
      .order("created_at", { ascending: false });
    if (data) setRows(data as unknown as Row[]);
    setHydrated(true);
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const custom = rows.map((r) => ({ ...r.data, handle: r.handle }));
  const profiles: ClientProfile[] = [
    ...custom,
    ...SEED_CLIENT_PROFILES.filter((s) => !custom.some((c) => c.handle === s.handle)),
  ];

  const store: ClientStore = {
    hydrated,
    profiles,
    myProfiles: user
      ? rows.filter((r) => r.owner_id === user.id).map((r) => ({ ...r.data, handle: r.handle }))
      : [],
    getProfile: (handle) => profiles.find((p) => p.handle === handle),
    saveProfile: async (profile) => {
      if (!user) throw new Error("Tienes que iniciar sesión");
      const existing = rows.find((r) => r.handle === profile.handle);
      const { error } = await supabase.from("client_profiles").upsert({
        handle: profile.handle,
        owner_id: existing?.owner_id ?? user.id,
        data: profile as never,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await load();
    },
    removeProfile: async (handle) => {
      const { error } = await supabase.from("client_profiles").delete().eq("handle", handle);
      if (error) throw error;
      await load();
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useClients(): ClientStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClients must be used inside ClientProvider");
  return ctx;
}
