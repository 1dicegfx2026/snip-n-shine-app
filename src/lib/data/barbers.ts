import marcusAvatar from "@/assets/barbers/marcus.jpg";
import diegoAvatar from "@/assets/barbers/diego.jpg";
import amaraAvatar from "@/assets/barbers/amara.jpg";
import julianAvatar from "@/assets/barbers/julian.jpg";
import sofiaAvatar from "@/assets/barbers/sofia.jpg";
import kenjiAvatar from "@/assets/barbers/kenji.jpg";
import lenaAvatar from "@/assets/barbers/lena.jpg";
import andreAvatar from "@/assets/barbers/andre.jpg";
import fadeShot from "@/assets/portfolio/fade.jpg";
import braidsShot from "@/assets/portfolio/braids.jpg";
import razorShot from "@/assets/portfolio/razor.jpg";
import balayageShot from "@/assets/portfolio/balayage.jpg";

export type ServiceCategory =
  | "Cuts"
  | "Fades"
  | "Beard"
  | "Braids"
  | "Color"
  | "Shave"
  | "Nails"
  | "Styling";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  service: string;
  text: string;
}

export interface Barber {
  slug: string;
  name: string;
  shop: string;
  type: "barber" | "salon";
  tagline: string;
  rating: number;
  reviewCount: number;
  location: string;
  neighborhood: string;
  distanceMi: number;
  priceTier: 1 | 2 | 3;
  avatar: string;
  portfolio: string[];
  specialties: string[];
  openHour: number; // 24h
  closeHour: number;
  services: Service[];
  reviews: Review[];
  yearsExperience: number;
  nextAvailableHint: string;
}

export const CATEGORIES: { name: ServiceCategory; blurb: string }[] = [
  { name: "Cuts", blurb: "Signature scissor & clipper work" },
  { name: "Fades", blurb: "Skin, taper, burst & drop fades" },
  { name: "Beard", blurb: "Sculpting, shaping & hot towel care" },
  { name: "Braids", blurb: "Box braids, cornrows, locs & twists" },
  { name: "Color", blurb: "Balayage, platinum, vivid & gloss" },
  { name: "Shave", blurb: "Straight-razor ritual shaves" },
  { name: "Nails", blurb: "Manicure, gel & nail art" },
  { name: "Styling", blurb: "Silk press, blowouts & updos" },
];

export const BARBERS: Barber[] = [
  {
    slug: "marcus-cole",
    name: "Marcus “Blade” Cole",
    shop: "The Gilded Chair",
    type: "barber",
    tagline: "Skin fades so clean they catch light.",
    rating: 4.98,
    reviewCount: 412,
    location: "214 Mercer St, New York, NY",
    neighborhood: "SoHo",
    distanceMi: 0.6,
    priceTier: 3,
    avatar: marcusAvatar,
    portfolio: [fadeShot, razorShot, balayageShot],
    specialties: ["Skin Fades", "Waves", "Beard Sculpting"],
    openHour: 9,
    closeHour: 19,
    yearsExperience: 14,
    nextAvailableHint: "Today",
    services: [
      { id: "mc-1", name: "Signature Skin Fade", category: "Fades", durationMin: 45, price: 65 },
      { id: "mc-2", name: "Executive Cut & Style", category: "Cuts", durationMin: 40, price: 55 },
      { id: "mc-3", name: "Beard Sculpt & Hot Towel", category: "Beard", durationMin: 30, price: 40 },
      { id: "mc-4", name: "The Full Works (Cut + Beard)", category: "Cuts", durationMin: 75, price: 95 },
      { id: "mc-5", name: "Straight-Razor Head Shave", category: "Shave", durationMin: 40, price: 60 },
    ],
    reviews: [
      { id: "r1", author: "Devon W.", rating: 5, date: "Aug 28, 2026", service: "Signature Skin Fade", text: "Best fade of my life. Marcus measures twice, cuts once — the blend is flawless from every angle." },
      { id: "r2", author: "Chris P.", rating: 5, date: "Aug 19, 2026", service: "The Full Works", text: "Two hours before my wedding he turned me into the best version of myself. Worth every cent." },
      { id: "r3", author: "Andre L.", rating: 4, date: "Aug 2, 2026", service: "Beard Sculpt & Hot Towel", text: "Hot towel ritual is unreal. Booked my next three appointments before I left the chair." },
    ],
  },
  {
    slug: "diego-ferreira",
    name: "Diego Ferreira",
    shop: "Lâmina Studio",
    type: "barber",
    tagline: "Straight-razor artist. Old school soul, new school precision.",
    rating: 4.94,
    reviewCount: 328,
    location: "88 Grand St, New York, NY",
    neighborhood: "SoHo",
    distanceMi: 0.9,
    priceTier: 2,
    avatar: diegoAvatar,
    portfolio: [razorShot, fadeShot],
    specialties: ["Straight-Razor Shaves", "Classic Cuts", "Hot Towel Rituals"],
    openHour: 10,
    closeHour: 20,
    yearsExperience: 11,
    nextAvailableHint: "Today",
    services: [
      { id: "df-1", name: "Royal Hot Towel Shave", category: "Shave", durationMin: 45, price: 50 },
      { id: "df-2", name: "Classic Gentlemen's Cut", category: "Cuts", durationMin: 40, price: 45 },
      { id: "df-3", name: "Beard Trim & Line-Up", category: "Beard", durationMin: 25, price: 30 },
      { id: "df-4", name: "Cut + Shave Ritual", category: "Shave", durationMin: 80, price: 85 },
    ],
    reviews: [
      { id: "r4", author: "Marco T.", rating: 5, date: "Aug 25, 2026", service: "Royal Hot Towel Shave", text: "Forty-five minutes of pure ceremony. My face has never been this smooth." },
      { id: "r5", author: "Jules B.", rating: 5, date: "Aug 10, 2026", service: "Cut + Shave Ritual", text: "Diego treats shaving like an art form. The studio itself feels like a private club." },
      { id: "r6", author: "Sam K.", rating: 4, date: "Jul 30, 2026", service: "Classic Gentlemen's Cut", text: "Great cut, great conversation, great espresso. Runs 10 min behind sometimes — worth it." },
    ],
  },
  {
    slug: "amara-osei",
    name: "Amara Osei",
    shop: "Crown & Gold",
    type: "salon",
    tagline: "Braids, locs and crowns worthy of royalty.",
    rating: 5.0,
    reviewCount: 517,
    location: "512 Fulton St, Brooklyn, NY",
    neighborhood: "Fort Greene",
    distanceMi: 2.4,
    priceTier: 2,
    avatar: amaraAvatar,
    portfolio: [braidsShot, balayageShot],
    specialties: ["Box Braids", "Knotless Braids", "Loc Maintenance"],
    openHour: 9,
    closeHour: 18,
    yearsExperience: 12,
    nextAvailableHint: "Tomorrow",
    services: [
      { id: "ao-1", name: "Knotless Box Braids", category: "Braids", durationMin: 240, price: 220 },
      { id: "ao-2", name: "Cornrow Design", category: "Braids", durationMin: 120, price: 110 },
      { id: "ao-3", name: "Loc Retwist & Style", category: "Braids", durationMin: 90, price: 95 },
      { id: "ao-4", name: "Silk Press", category: "Styling", durationMin: 120, price: 130 },
    ],
    reviews: [
      { id: "r7", author: "Nia J.", rating: 5, date: "Sep 1, 2026", service: "Knotless Box Braids", text: "Zero tension, perfect parts, and they lasted 8 weeks. Amara is simply the best in the city." },
      { id: "r8", author: "Tanya R.", rating: 5, date: "Aug 22, 2026", service: "Loc Retwist & Style", text: "My locs have never looked healthier. She explains everything she's doing and why." },
      { id: "r9", author: "Keisha M.", rating: 5, date: "Aug 5, 2026", service: "Silk Press", text: "Silk press moved like water. Got compliments from strangers all week." },
    ],
  },
  {
    slug: "julian-cross",
    name: "Julian Cross",
    shop: "Cross & Co. Barbers",
    type: "barber",
    tagline: "Classic cuts, Savile Row manners.",
    rating: 4.9,
    reviewCount: 264,
    location: "19 Bond St, New York, NY",
    neighborhood: "NoHo",
    distanceMi: 0.8,
    priceTier: 3,
    avatar: julianAvatar,
    portfolio: [fadeShot, razorShot],
    specialties: ["Classic Cuts", "Executive Styling", "Grey Blending"],
    openHour: 8,
    closeHour: 18,
    yearsExperience: 18,
    nextAvailableHint: "Today",
    services: [
      { id: "jc-1", name: "The Boardroom Cut", category: "Cuts", durationMin: 45, price: 70 },
      { id: "jc-2", name: "Scissor-Only Precision Cut", category: "Cuts", durationMin: 50, price: 80 },
      { id: "jc-3", name: "Grey Blending", category: "Color", durationMin: 30, price: 45 },
      { id: "jc-4", name: "Cut, Shave & Shoe Shine", category: "Shave", durationMin: 90, price: 120 },
    ],
    reviews: [
      { id: "r10", author: "Henry D.", rating: 5, date: "Aug 29, 2026", service: "The Boardroom Cut", text: "Julian has cut my hair for six years. I have never once left anything less than delighted." },
      { id: "r11", author: "Oliver S.", rating: 5, date: "Aug 12, 2026", service: "Cut, Shave & Shoe Shine", text: "The full ritual is the best 90 minutes in Manhattan. Impeccable." },
      { id: "r12", author: "George F.", rating: 4, date: "Jul 28, 2026", service: "Grey Blending", text: "Subtle, natural, no one could tell — exactly what I asked for." },
    ],
  },
  {
    slug: "sofia-marchetti",
    name: "Sofia Marchetti",
    shop: "Atelier Marchetti",
    type: "salon",
    tagline: "Color that looks like you were born with it.",
    rating: 4.96,
    reviewCount: 389,
    location: "301 Bleecker St, New York, NY",
    neighborhood: "West Village",
    distanceMi: 1.3,
    priceTier: 3,
    avatar: sofiaAvatar,
    portfolio: [balayageShot, braidsShot],
    specialties: ["Balayage", "Platinum", "Color Correction"],
    openHour: 10,
    closeHour: 19,
    yearsExperience: 10,
    nextAvailableHint: "Tomorrow",
    services: [
      { id: "sm-1", name: "Signature Balayage", category: "Color", durationMin: 180, price: 260 },
      { id: "sm-2", name: "Full Platinum Transformation", category: "Color", durationMin: 240, price: 340 },
      { id: "sm-3", name: "Gloss & Blowout", category: "Styling", durationMin: 60, price: 90 },
      { id: "sm-4", name: "Color Correction Consult", category: "Color", durationMin: 45, price: 60 },
    ],
    reviews: [
      { id: "r13", author: "Elena V.", rating: 5, date: "Aug 30, 2026", service: "Signature Balayage", text: "Sofia fixed a box-dye disaster and gave me the most expensive-looking hair I've ever had." },
      { id: "r14", author: "Priya N.", rating: 5, date: "Aug 15, 2026", service: "Full Platinum Transformation", text: "Six hours, zero damage, pure platinum. She's a scientist and an artist." },
      { id: "r15", author: "Mia C.", rating: 4, date: "Aug 1, 2026", service: "Gloss & Blowout", text: "The gloss made my color look brand new. Atelier is gorgeous too." },
    ],
  },
  {
    slug: "kenji-tanaka",
    name: "Kenji Tanaka",
    shop: "Tanaka Precision",
    type: "barber",
    tagline: "Japanese scissor craft, millimetre by millimetre.",
    rating: 4.97,
    reviewCount: 231,
    location: "47 Elizabeth St, New York, NY",
    neighborhood: "Nolita",
    distanceMi: 1.0,
    priceTier: 3,
    avatar: kenjiAvatar,
    portfolio: [fadeShot, balayageShot],
    specialties: ["Precision Scissor Cuts", "Textured Crops", "Two-Block Cuts"],
    openHour: 10,
    closeHour: 19,
    yearsExperience: 15,
    nextAvailableHint: "Today",
    services: [
      { id: "kt-1", name: "Precision Scissor Cut", category: "Cuts", durationMin: 60, price: 85 },
      { id: "kt-2", name: "Textured Crop", category: "Cuts", durationMin: 45, price: 65 },
      { id: "kt-3", name: "Two-Block Cut", category: "Fades", durationMin: 50, price: 70 },
      { id: "kt-4", name: "Scalp Treatment & Head Spa", category: "Styling", durationMin: 45, price: 75 },
    ],
    reviews: [
      { id: "r16", author: "Daniel H.", rating: 5, date: "Aug 27, 2026", service: "Precision Scissor Cut", text: "Kenji spent a full hour with scissors alone. The cut grows out beautifully — still sharp at week five." },
      { id: "r17", author: "Jae P.", rating: 5, date: "Aug 9, 2026", service: "Two-Block Cut", text: "Finally someone who understands Asian hair texture. Flawless two-block." },
      { id: "r18", author: "Leo M.", rating: 4, date: "Jul 22, 2026", service: "Head Spa", text: "The head spa is meditative. Nearly fell asleep in the chair." },
    ],
  },
  {
    slug: "lena-vogt",
    name: "Lena Vogt",
    shop: "Vogt Nail Atelier",
    type: "salon",
    tagline: "Nails as jewellery — chrome, gold leaf and gel art.",
    rating: 4.93,
    reviewCount: 298,
    location: "162 Roebling St, Brooklyn, NY",
    neighborhood: "Williamsburg",
    distanceMi: 3.1,
    priceTier: 2,
    avatar: lenaAvatar,
    portfolio: [balayageShot, braidsShot],
    specialties: ["Gel Art", "Chrome & Gold Leaf", "Sculpted Extensions"],
    openHour: 10,
    closeHour: 20,
    yearsExperience: 8,
    nextAvailableHint: "Today",
    services: [
      { id: "lv-1", name: "Signature Gel Manicure", category: "Nails", durationMin: 60, price: 70 },
      { id: "lv-2", name: "Chrome & Gold Leaf Art Set", category: "Nails", durationMin: 90, price: 110 },
      { id: "lv-3", name: "Sculpted Gel Extensions", category: "Nails", durationMin: 120, price: 140 },
      { id: "lv-4", name: "Luxury Pedicure", category: "Nails", durationMin: 75, price: 95 },
    ],
    reviews: [
      { id: "r19", author: "Zoe A.", rating: 5, date: "Sep 2, 2026", service: "Chrome & Gold Leaf Art Set", text: "My nails look like tiny pieces of jewelry. Lena hand-paints every detail." },
      { id: "r20", author: "Hana S.", rating: 5, date: "Aug 18, 2026", service: "Sculpted Gel Extensions", text: "Strongest, most natural-looking extensions I've had. Four weeks, zero lifting." },
      { id: "r21", author: "Bella R.", rating: 4, date: "Aug 3, 2026", service: "Luxury Pedicure", text: "The pedicure includes a hot stone massage. Pure indulgence." },
    ],
  },
  {
    slug: "andre-baptiste",
    name: "André Baptiste",
    shop: "Baptiste Beard House",
    type: "barber",
    tagline: "Beards sculpted like architecture.",
    rating: 4.95,
    reviewCount: 276,
    location: "255 Bedford Ave, Brooklyn, NY",
    neighborhood: "Williamsburg",
    distanceMi: 3.4,
    priceTier: 2,
    avatar: andreAvatar,
    portfolio: [razorShot, fadeShot],
    specialties: ["Beard Sculpting", "Hot Towel Shaves", "Line-Ups"],
    openHour: 9,
    closeHour: 19,
    yearsExperience: 9,
    nextAvailableHint: "Tomorrow",
    services: [
      { id: "ab-1", name: "Architectural Beard Sculpt", category: "Beard", durationMin: 40, price: 45 },
      { id: "ab-2", name: "Hot Towel Straight Shave", category: "Shave", durationMin: 40, price: 50 },
      { id: "ab-3", name: "Crisp Line-Up", category: "Fades", durationMin: 20, price: 25 },
      { id: "ab-4", name: "Cut + Beard Architecture", category: "Cuts", durationMin: 70, price: 85 },
    ],
    reviews: [
      { id: "r22", author: "Malik J.", rating: 5, date: "Aug 26, 2026", service: "Architectural Beard Sculpt", text: "André reshaped my whole face with a beard trim. The geometry is unreal." },
      { id: "r23", author: "Tom E.", rating: 5, date: "Aug 14, 2026", service: "Hot Towel Straight Shave", text: "Best straight shave outside of Istanbul. The oils he uses smell incredible." },
      { id: "r24", author: "Ray D.", rating: 4, date: "Jul 29, 2026", service: "Cut + Beard Architecture", text: "Walked in scruffy, walked out looking like a cologne ad." },
    ],
  },
];

export function getBarber(slug: string): Barber | undefined {
  return BARBERS.find((b) => b.slug === slug);
}

/* ---------- Availability ---------- */

export interface Slot {
  time: string; // "09:30"
  label: string; // "9:30 AM"
  status: "available" | "booked";
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatTime(h: number, m: number): { time: string; label: string } {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hh}:${mm}`, label: `${h12}:${mm} ${ampm}` };
}

/** Deterministic per-barber, per-day slot grid. extraBooked = slots booked in this session. */
export function getSlots(barber: Barber, dateISO: string, extraBooked: string[] = []): Slot[] {
  const slots: Slot[] = [];
  for (let h = barber.openHour; h < barber.closeHour; h++) {
    for (const m of [0, 30]) {
      const { time, label } = formatTime(h, m);
      const booked =
        extraBooked.includes(time) ||
        hash(`${barber.slug}|${dateISO}|${time}`) % 10 < 4; // ~40% taken
      slots.push({ time, label, status: booked ? "booked" : "available" });
    }
  }
  return slots;
}

export function nextNDates(n: number): { iso: string; weekday: string; day: string; month: string }[] {
  const out = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: String(d.getDate()),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const DEPOSIT_RATE = 0.25;
