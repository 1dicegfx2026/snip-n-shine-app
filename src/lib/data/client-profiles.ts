import type { Socials, WorkItem } from "@/lib/data/pro-pages";
import fadeShot from "@/assets/portfolio/fade.jpg";
import braidsShot from "@/assets/portfolio/braids.jpg";
import balayageShot from "@/assets/portfolio/balayage.jpg";
import heroImg from "@/assets/hero.jpg";

export interface ClientProfile {
  handle: string;
  name: string;
  city: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  accent: string;
  socials: Socials;
  /** Fotos de sus looks, por categoría */
  looks: WorkItem[];
  favoriteStyles: string[];
  favoriteBarbers: string[];
  createdAt: number;
}

export const CLIENT_CATEGORIES = [
  "Fades",
  "Beard",
  "Braids",
  "Color",
  "Styling",
  "Nails",
  "Antes y después",
];

export const SEED_CLIENT_PROFILES: ClientProfile[] = [
  {
    handle: "kiko",
    name: "Kiko Ramos",
    city: "Bronx, New York",
    tagline: "Fade cada 10 días, sin excusas.",
    bio: "Cliente fiel desde el 2019. Aquí guardo todos mis looks para enseñarle al barbero exactamente lo que quiero.",
    avatarUrl: fadeShot,
    bannerUrl: heroImg,
    accent: "#d4af37",
    socials: {
      tiktok: "https://tiktok.com/@kikofades",
      instagram: "https://instagram.com/kikofades",
      youtube: "",
      facebook: "",
      website: "",
    },
    looks: [
      { id: "l1", category: "Fades", title: "Mid fade con línea", imageUrl: fadeShot },
      { id: "l2", category: "Beard", title: "Barba perfilada", imageUrl: balayageShot },
    ],
    favoriteStyles: ["Mid fade", "Line up", "Barba"],
    favoriteBarbers: ["marcus-cole"],
    createdAt: Date.now(),
  },
  {
    handle: "lisbeth",
    name: "Lisbeth Cruz",
    city: "Harlem, New York",
    tagline: "Trenzas nuevas cada temporada.",
    bio: "Me encanta documentar cada estilo. Uso mi página para compartir el antes y después con mi trenzadora.",
    avatarUrl: braidsShot,
    bannerUrl: braidsShot,
    accent: "#2fbf71",
    socials: {
      tiktok: "",
      instagram: "https://instagram.com/lisbraids",
      youtube: "",
      facebook: "",
      website: "",
    },
    looks: [
      { id: "l1", category: "Braids", title: "Knotless largas", imageUrl: braidsShot },
      { id: "l2", category: "Color", title: "Reflejos miel", imageUrl: balayageShot },
    ],
    favoriteStyles: ["Knotless", "Cornrows"],
    favoriteBarbers: ["amara-reid"],
    createdAt: Date.now(),
  },
];
