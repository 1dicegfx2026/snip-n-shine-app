import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_PRO_PAGES, type ProPage } from "@/lib/data/pro-pages";

interface ProStore {
  hydrated: boolean;
  pages: ProPage[];
  getPage: (handle: string) => ProPage | undefined;
  savePage: (page: ProPage) => void;
  removePage: (handle: string) => void;
}

const KEY = "gilt-pro-pages-v1";
const Ctx = createContext<ProStore | null>(null);

export function ProProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [custom, setCustom] = useState<ProPage[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCustom(JSON.parse(raw) as ProPage[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(custom));
  }, [custom, hydrated]);

  const pages: ProPage[] = [
    ...custom,
    ...SEED_PRO_PAGES.filter((s) => !custom.some((c) => c.handle === s.handle)),
  ];

  const store: ProStore = {
    hydrated,
    pages,
    getPage: (handle) => pages.find((p) => p.handle === handle),
    savePage: (page) => setCustom((prev) => [page, ...prev.filter((p) => p.handle !== page.handle)]),
    removePage: (handle) => setCustom((prev) => prev.filter((p) => p.handle !== handle)),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePros(): ProStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePros must be used inside ProProvider");
  return ctx;
}
