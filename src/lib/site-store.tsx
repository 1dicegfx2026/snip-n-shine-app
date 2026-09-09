import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CelebProfile } from "@/lib/data/celebrities";
import { SPONSORS, type Sponsor } from "@/lib/data/sponsors";
import heroImg from "@/assets/hero.jpg";
import promoShot from "@/assets/promo/promo-2.jpg";

export type PayMethod = "card" | "zelle" | "cashapp" | "applepay" | "paypal" | "venmo";

export const PAY_METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: "card", label: "Tarjeta", hint: "Visa, Mastercard, Amex — cobro seguro." },
  { id: "zelle", label: "Zelle", hint: "Envía a pagos@giltbooking.com y pon tu nombre en la nota." },
  { id: "cashapp", label: "Cash App", hint: "$GILTBOOKING — incluye el código de tu cita." },
  { id: "applepay", label: "Apple Pay", hint: "Confirma con Face ID en el checkout." },
  { id: "paypal", label: "PayPal", hint: "pagos@giltbooking.com — enviar como bienes y servicios." },
  { id: "venmo", label: "Venmo", hint: "@GILT-Booking — nota privada con tu nombre." },
];

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  /** mp4/webm URL for video slides, empty for image slides */
  videoUrl: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
}

export interface CelebRequest {
  id: string;
  celebSlug: string;
  celebName: string;
  serviceName: string;
  price: number;
  dateISO: string;
  time: string;
  name: string;
  contact: string;
  payMethod: PayMethod;
  message: string;
  createdAt: number;
  status: "pending" | "cancelled";
}

export interface Lead {
  id: string;
  kind: "affiliate" | "sponsor";
  name: string;
  email: string;
  detail: string;
  createdAt: number;
}

interface SiteStore {
  hydrated: boolean;
  slides: HeroSlide[];
  addSlide: (s: Omit<HeroSlide, "id">) => void;
  updateSlide: (id: string, patch: Partial<HeroSlide>) => void;
  removeSlide: (id: string) => void;
  celebProfiles: CelebProfile[];
  saveCelebProfile: (p: CelebProfile) => void;
  removeCelebProfile: (slug: string) => void;
  requests: CelebRequest[];
  addRequest: (r: Omit<CelebRequest, "id" | "createdAt" | "status">) => CelebRequest;
  cancelRequest: (id: string) => void;
  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  sponsors: Sponsor[];
  saveSponsor: (s: Sponsor) => void;
  removeSponsor: (id: string) => void;
}

const KEY = "gilt-site-v1";
const SiteContext = createContext<SiteStore | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    title: "Tu silla te está esperando",
    subtitle: "Sube aquí tu propio video de un corte y sale en portada.",
    videoUrl: "",
    imageUrl: heroImg,
    ctaLabel: "Explorar pros",
    ctaUrl: "/explore",
    active: true,
  },
  {
    id: "default-2",
    title: "Cortes que se sienten en cámara",
    subtitle: "Reserva con depósito y llega sin esperar.",
    videoUrl: "",
    imageUrl: promoShot,
    ctaLabel: "Ver artistas celebrity",
    ctaUrl: "/celebrities",
    active: true,
  },
];

export function SiteProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [celebProfiles, setCelebProfiles] = useState<CelebProfile[]>([]);
  const [requests, setRequests] = useState<CelebRequest[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>(SPONSORS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.slides) && p.slides.length) setSlides(p.slides);
        setCelebProfiles(p.celebProfiles ?? []);
        setRequests(p.requests ?? []);
        setLeads(p.leads ?? []);
        if (Array.isArray(p.sponsors) && p.sponsors.length) setSponsors(p.sponsors);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ slides, celebProfiles, requests, leads, sponsors }));
  }, [slides, celebProfiles, requests, leads, sponsors, hydrated]);

  const store: SiteStore = {
    hydrated,
    slides,
    addSlide: (s) => setSlides((prev) => [...prev, { ...s, id: uid() }]),
    updateSlide: (id, patch) =>
      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeSlide: (id) => setSlides((prev) => prev.filter((s) => s.id !== id)),
    celebProfiles,
    saveCelebProfile: (p) =>
      setCelebProfiles((prev) => [...prev.filter((c) => c.slug !== p.slug), p]),
    removeCelebProfile: (slug) => setCelebProfiles((prev) => prev.filter((c) => c.slug !== slug)),
    requests,
    addRequest: (r) => {
      const req: CelebRequest = { ...r, id: uid(), createdAt: Date.now(), status: "pending" };
      setRequests((prev) => [...prev, req]);
      return req;
    },
    cancelRequest: (id) =>
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r))),
    leads,
    addLead: (l) => setLeads((prev) => [...prev, { ...l, id: uid(), createdAt: Date.now() }]),
    sponsors,
    saveSponsor: (sp) =>
      setSponsors((prev) =>
        prev.some((x) => x.id === sp.id)
          ? prev.map((x) => (x.id === sp.id ? sp : x))
          : [...prev, sp],
      ),
    removeSponsor: (id) => setSponsors((prev) => prev.filter((x) => x.id !== id)),
  };

  return <SiteContext.Provider value={store}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteStore {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
