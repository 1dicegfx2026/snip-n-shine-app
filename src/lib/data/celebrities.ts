import celeb1 from "@/assets/celebs/celeb-1.jpg";
import celeb2 from "@/assets/celebs/celeb-2.jpg";
import celeb3 from "@/assets/celebs/celeb-3.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";
import braidsShot from "@/assets/portfolio/braids.jpg";
import razorShot from "@/assets/portfolio/razor.jpg";
import balayageShot from "@/assets/portfolio/balayage.jpg";
import promoShot from "@/assets/promo/promo-2.jpg";

export interface CelebService {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  note: string;
}

export interface CelebTrack {
  title: string;
  vibe: string;
  length: string;
}

export interface CelebGuestbookEntry {
  author: string;
  text: string;
  date: string;
}

export interface CelebProfile {
  slug: string;
  name: string;
  alias: string;
  role: string;
  city: string;
  avatar: string;
  banner: string;
  /** MySpace-style theme colors, stored as raw CSS colors chosen by the artist */
  themeBg: string;
  themeAccent: string;
  mood: string;
  status: string;
  tagline: string;
  bio: string;
  verified: boolean;
  followers: number;
  services: CelebService[];
  gallery: string[];
  tracks: CelebTrack[];
  topFriends: string[];
  guestbook: CelebGuestbookEntry[];
  custom: boolean;
}

export const CELEB_ROLES = [
  "Recording artist",
  "Celebrity barber",
  "Stylist to the stars",
  "Content creator",
  "DJ / Producer",
  "Athlete",
] as const;

export const CELEBRITIES: CelebProfile[] = [
  {
    slug: "ayuso",
    name: "Ayuso",
    alias: "EL DE LA VOZ",
    role: "Recording artist",
    city: "San Juan, PR",
    avatar: celeb1,
    banner: promoShot,
    themeBg: "#0b0b0c",
    themeAccent: "#d9b24c",
    mood: "🔥 en el estudio",
    status: "Booking studio sessions + private cuts",
    tagline: "Music first. Lineup always sharp.",
    bio: "Desde Puerto Rico pa'l mundo. Ayuso lleva más de una década haciendo música urbana y ahora abre su agenda directo a los fans: sesiones privadas, meet & greets y cortes con su barbero personal en cámara.",
    verified: true,
    followers: 1840000,
    services: [
      { id: "meet", name: "Meet & greet (15 min)", price: 250, durationMin: 15, note: "Foto, autógrafo y saludo en persona." },
      { id: "studio", name: "Studio session hour", price: 1200, durationMin: 60, note: "Una hora en cabina contigo o tu artista." },
      { id: "cut", name: "Corte + contenido", price: 600, durationMin: 90, note: "Corte con su barbero y clip para tus redes." },
    ],
    gallery: [fadeShot, razorShot, promoShot],
    tracks: [
      { title: "Noche de Oro", vibe: "Reggaetón", length: "3:12" },
      { title: "Barrio Luces", vibe: "Trap latino", length: "2:48" },
      { title: "Filo", vibe: "Dembow", length: "3:31" },
    ],
    topFriends: ["de-la-ghetto", "platano-gucci"],
    guestbook: [
      { author: "Yaris M.", text: "Booking directo con Ayuso? Esto es otro nivel.", date: "Aug 28" },
      { author: "Kevin R.", text: "El meet & greet valió cada peso. Bien profesional.", date: "Aug 12" },
    ],
    custom: false,
  },
  {
    slug: "de-la-ghetto",
    name: "De La Ghetto",
    alias: "GEEZY BOYZ",
    role: "Recording artist",
    city: "Miami, FL",
    avatar: celeb2,
    banner: fadeShot,
    themeBg: "#07120d",
    themeAccent: "#2fbf71",
    mood: "🕶️ modo tour",
    status: "Fechas limitadas — solo fines de semana",
    tagline: "Si es contigo, es un vibe.",
    bio: "Pionero del movimiento. Entre giras, De La Ghetto abre bloques de agenda para colaboraciones, apariciones en shops y sesiones de contenido con las barberías top del país.",
    verified: true,
    followers: 3210000,
    services: [
      { id: "appearance", name: "Shop appearance (2h)", price: 4500, durationMin: 120, note: "Aparición en tu barbería con promoción en sus redes." },
      { id: "collab", name: "Colaboración de contenido", price: 2000, durationMin: 60, note: "Reel/TikTok grabado contigo." },
      { id: "call", name: "Video call VIP", price: 400, durationMin: 20, note: "Llamada privada con el fan." },
    ],
    gallery: [braidsShot, promoShot, balayageShot],
    tracks: [
      { title: "Sube el Volumen", vibe: "Perreo", length: "3:05" },
      { title: "Cristal", vibe: "R&B latino", length: "3:44" },
    ],
    topFriends: ["ayuso", "platano-gucci"],
    guestbook: [{ author: "Shop Owner Luis", text: "Nos llenó la barbería un sábado completo.", date: "Jul 30" }],
    custom: false,
  },
  {
    slug: "platano-gucci",
    name: "Plátano Gucci",
    alias: "EL PLÁTANO",
    role: "Content creator",
    city: "Bronx, NY",
    avatar: celeb3,
    banner: braidsShot,
    themeBg: "#120a14",
    themeAccent: "#c084fc",
    mood: "😎 tirando chistes",
    status: "Abierto para colabs y podcasts",
    tagline: "Trenzas, cámara y mucha bulla.",
    bio: "Creador de contenido del Bronx con la energía más alta del internet. Hace colabs con barberías, podcasts y días de grabación donde tú eres el protagonista.",
    verified: true,
    followers: 920000,
    services: [
      { id: "podcast", name: "Invitado en tu podcast", price: 900, durationMin: 60, note: "Una hora al aire contigo." },
      { id: "shoot", name: "Día de grabación", price: 1500, durationMin: 180, note: "Contenido para tu marca o barbería." },
      { id: "hangout", name: "Hangout + corte", price: 350, durationMin: 60, note: "Se sienta contigo en la silla y grabamos." },
    ],
    gallery: [braidsShot, fadeShot, razorShot],
    tracks: [{ title: "Intro del Plátano", vibe: "Skit", length: "1:10" }],
    topFriends: ["ayuso", "de-la-ghetto"],
    guestbook: [{ author: "Nina", text: "Se pasó de gracioso, el contenido explotó.", date: "Aug 02" }],
    custom: false,
  },
];

export function getCelebrity(slug: string, extra: CelebProfile[] = []): CelebProfile | undefined {
  return [...CELEBRITIES, ...extra].find((c) => c.slug === slug);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}
