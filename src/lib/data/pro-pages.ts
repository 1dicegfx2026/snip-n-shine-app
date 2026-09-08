import marcusAvatar from "@/assets/barbers/marcus.jpg";
import diegoAvatar from "@/assets/barbers/diego.jpg";
import amaraAvatar from "@/assets/barbers/amara.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";
import braidsShot from "@/assets/portfolio/braids.jpg";
import razorShot from "@/assets/portfolio/razor.jpg";
import balayageShot from "@/assets/portfolio/balayage.jpg";
import heroImg from "@/assets/hero.jpg";

export type PlanId = "basic" | "pro" | "elite";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  commission: number;
  perks: string[];
  featured?: boolean;
}

/** Comisión de la plataforma por cada corte reservado */
export const BASE_COMMISSION = 0.1;

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 19,
    commission: 0.1,
    perks: [
      "Tu página personal en GILT",
      "Reservas ilimitadas con depósito",
      "Trabajos por categoría",
      "10% de comisión por corte",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    commission: 0.08,
    perks: [
      "Todo lo del Básico",
      "Clases en vivo con cobro por entrada",
      "Perfil destacado en Explore",
      "Redes conectadas (TikTok, IG, YouTube, Facebook)",
      "8% de comisión por corte",
    ],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    commission: 0.05,
    perks: [
      "Todo lo del Pro",
      "Banners de sponsors en tu página (te quedas el 100%)",
      "Portada e historias en la home",
      "Importación de clientes desde Booksy y otras apps",
      "5% de comisión por corte",
    ],
  },
];

export interface WorkItem {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
}

export interface LiveClass {
  id: string;
  title: string;
  dateLabel: string;
  durationMin: number;
  price: number;
  platform: string;
  seats: number;
  description: string;
}

export interface SponsorBanner {
  id: string;
  brand: string;
  text: string;
  imageUrl: string;
  url: string;
}

export interface Socials {
  tiktok: string;
  instagram: string;
  youtube: string;
  facebook: string;
  website: string;
}

export interface ProPage {
  handle: string;
  name: string;
  shop: string;
  city: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  accent: string;
  plan: PlanId;
  barberSlug: string; // enlaza con la ficha de reservas si existe
  socials: Socials;
  work: WorkItem[];
  classes: LiveClass[];
  sponsors: SponsorBanner[];
  importedFrom: string[];
  clientsImported: number;
  createdAt: number;
}

export const SEED_PRO_PAGES: ProPage[] = [
  {
    handle: "marcus",
    name: "Marcus “Blade” Cole",
    shop: "The Gilded Chair",
    city: "SoHo, New York",
    tagline: "Skin fades so clean they catch light.",
    bio: "14 años detrás de la silla. Enseño el blend perfecto en vivo cada semana y corto a artistas, atletas y a quien quiera verse nítido.",
    avatarUrl: marcusAvatar,
    bannerUrl: heroImg,
    accent: "#d4af37",
    plan: "elite",
    barberSlug: "marcus-cole",
    socials: {
      tiktok: "https://tiktok.com/@bladecuts",
      instagram: "https://instagram.com/bladecuts",
      youtube: "https://youtube.com/@bladecuts",
      facebook: "https://facebook.com/bladecuts",
      website: "",
    },
    work: [
      { id: "w1", category: "Fades", title: "Skin fade + waves", imageUrl: fadeShot },
      { id: "w2", category: "Shave", title: "Straight razor ritual", imageUrl: razorShot },
      { id: "w3", category: "Color", title: "Platinum gloss", imageUrl: balayageShot },
    ],
    classes: [
      {
        id: "c1",
        title: "Blend Masterclass: el fade invisible",
        dateLabel: "Jueves 8:00 PM ET",
        durationMin: 90,
        price: 45,
        platform: "GILT Live",
        seats: 40,
        description: "Cámara sobre la silla, paso a paso, con preguntas en vivo al final.",
      },
    ],
    sponsors: [
      {
        id: "s1",
        brand: "Wahl Pro",
        text: "Máquinas oficiales de la clase en vivo — 15% con código BLADE.",
        imageUrl: razorShot,
        url: "https://example.com",
      },
    ],
    importedFrom: ["Booksy", "Square"],
    clientsImported: 412,
    createdAt: Date.now(),
  },
  {
    handle: "diego",
    name: "Diego Ferreira",
    shop: "Lâmina Studio",
    city: "SoHo, New York",
    tagline: "Old school soul, new school precision.",
    bio: "Navaja, toalla caliente y música buena. Reservo por GILT y subo cada corte a TikTok.",
    avatarUrl: diegoAvatar,
    bannerUrl: razorShot,
    accent: "#2fbf71",
    plan: "pro",
    barberSlug: "diego-ferreira",
    socials: {
      tiktok: "https://tiktok.com/@laminastudio",
      instagram: "https://instagram.com/laminastudio",
      youtube: "",
      facebook: "https://facebook.com/laminastudio",
      website: "",
    },
    work: [
      { id: "w1", category: "Shave", title: "Afeitado clásico", imageUrl: razorShot },
      { id: "w2", category: "Cuts", title: "Corte ejecutivo", imageUrl: fadeShot },
    ],
    classes: [
      {
        id: "c1",
        title: "Navaja sin miedo: básico de barbería clásica",
        dateLabel: "Martes 7:00 PM ET",
        durationMin: 60,
        price: 30,
        platform: "Instagram Live",
        seats: 25,
        description: "Ángulos, presión y cuidado de la piel para el afeitado con navaja.",
      },
    ],
    sponsors: [],
    importedFrom: ["Booksy"],
    clientsImported: 190,
    createdAt: Date.now(),
  },
  {
    handle: "amara",
    name: "Amara Reid",
    shop: "Halo Braiding House",
    city: "Harlem, New York",
    tagline: "Trenzas que duran y se ven de revista.",
    bio: "Box braids, cornrows y locs. Doy clases online para trenzadoras que quieren cobrar mejor.",
    avatarUrl: amaraAvatar,
    bannerUrl: braidsShot,
    accent: "#c0c0c0",
    plan: "pro",
    barberSlug: "amara-reid",
    socials: {
      tiktok: "https://tiktok.com/@halobraids",
      instagram: "https://instagram.com/halobraids",
      youtube: "https://youtube.com/@halobraids",
      facebook: "",
      website: "",
    },
    work: [
      { id: "w1", category: "Braids", title: "Knotless box braids", imageUrl: braidsShot },
      { id: "w2", category: "Styling", title: "Silk press", imageUrl: balayageShot },
    ],
    classes: [
      {
        id: "c1",
        title: "Cómo cobrar lo que vales por tus trenzas",
        dateLabel: "Domingo 5:00 PM ET",
        durationMin: 75,
        price: 35,
        platform: "YouTube Live",
        seats: 60,
        description: "Precios, tiempos y cómo llenar tu agenda sin quemarte.",
      },
    ],
    sponsors: [],
    importedFrom: [],
    clientsImported: 0,
    createdAt: Date.now(),
  },
];

export function planOf(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}
