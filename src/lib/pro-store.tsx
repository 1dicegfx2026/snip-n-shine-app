import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_PRO_PAGES, type ProPage } from "@/lib/data/pro-pages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface ProStore {
  hydrated: boolean;
  pages: ProPage[];
  /** Páginas creadas por el usuario que está firmado */
  myPages: ProPage[];
  getPage: (handle: string) => ProPage | undefined;
  savePage: (page: ProPage) => Promise<void>;
  removePage: (handle: string) => Promise<void>;
}

const Ctx = createContext<ProStore | null>(null);

interface Row {
  handle: string;
  owner_id: string;
  data: ProPage;
}

export function ProProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("pro_pages")
      .select("handle, owner_id, data")
      .order("created_at", { ascending: false });
    if (data) setRows(data as unknown as Row[]);
    setHydrated(true);
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const custom = rows.map((r) => ({ ...r.data, handle: r.handle }));
  const pages: ProPage[] = [
    ...custom,
    ...SEED_PRO_PAGES.filter((s) => !custom.some((c) => c.handle === s.handle)),
  ];

  const store: ProStore = {
    hydrated,
    pages,
    myPages: user
      ? rows.filter((r) => r.owner_id === user.id).map((r) => ({ ...r.data, handle: r.handle }))
      : [],
    getPage: (handle) => pages.find((p) => p.handle === handle),
    savePage: async (page) => {
      if (!user) throw new Error("Tienes que iniciar sesión");
      const { error } = await supabase
        .from("pro_pages")
        .upsert({ handle: page.handle, owner_id: user.id, data: page as never, updated_at: new Date().toISOString() });
      if (error) throw error;
      await load();
    },
    removePage: async (handle) => {
      const { error } = await supabase.from("pro_pages").delete().eq("handle", handle);
      if (error) throw error;
      await load();
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePros(): ProStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePros must be used inside ProProvider");
  return ctx;
}
