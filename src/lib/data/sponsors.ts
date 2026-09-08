import razorShot from "@/assets/portfolio/razor.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";
import balayageShot from "@/assets/portfolio/balayage.jpg";

export interface Sponsor {
  id: string;
  brand: string;
  tagline: string;
  offer: string;
  url: string;
  imageUrl: string;
  featured?: boolean;
}

export const SPONSORS: Sponsor[] = [
  {
    id: "sharp47",
    brand: "Sharp47",
    tagline: "Clipper & trimmers hechos para el trabajo profesional.",
    offer: "Descuento para pros verificados de GILT",
    url: "https://www.sharp47.com/products/sharp-47-clipper-and-trimmers",
    imageUrl: razorShot,
    featured: true,
  },
  {
    id: "gilt-supply",
    brand: "GILT Supply",
    tagline: "Pomadas, aceites y toallas calientes de nivel salón.",
    offer: "Kit de inicio 20% off con código GILT20",
    url: "/sponsors",
    imageUrl: fadeShot,
  },
  {
    id: "studio-lights",
    brand: "Studio Lights",
    tagline: "Luz de estudio para que cada corte se vea de revista.",
    offer: "Envío gratis a barberías",
    url: "/sponsors",
    imageUrl: balayageShot,
  },
];

export const FEATURED_SPONSOR = SPONSORS.find((s) => s.featured) ?? SPONSORS[0]!;
