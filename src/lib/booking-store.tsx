import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEPOSIT_RATE } from "@/lib/data/barbers";

export type BookingStatus = "upcoming" | "arrived" | "completed" | "cancelled" | "refunded";

export interface Booking {
  id: string;
  barberSlug: string;
  serviceId: string;
  dateISO: string;
  time: string;
  name: string;
  payType: "deposit" | "full";
  payMethod?: string;
  /** Porcentaje de depósito usado al reservar (0.25 = 25%) */
  depositRate: number;
  /** Comisión de la plataforma aplicada a este corte (0.1 = 10%) */
  commissionRate: number;
  amountPaid: number;
  refunded: number;
  total: number;
  createdAt: number;
  status: BookingStatus;
}

export interface WaitlistEntry {
  id: string;
  barberSlug: string;
  dateISO: string;
  time: string;
}

interface Store {
  hydrated: boolean;
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  addBooking: (
    b: Omit<Booking, "id" | "createdAt" | "status" | "refunded">,
  ) => Booking;
  /** El barbero marca que el cliente llegó: se cobra el resto antes de recortar */
  markArrived: (id: string) => void;
  completeBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  refundBooking: (id: string) => void;
  joinWaitlist: (e: Omit<WaitlistEntry, "id">) => void;
  leaveWaitlist: (id: string) => void;
  bookedTimesFor: (barberSlug: string, dateISO: string) => string[];
  depositRateFor: (barberSlug: string) => number;
  setDepositRate: (barberSlug: string, rate: number) => void;
}

const BookingContext = createContext<Store | null>(null);
const KEY = "gilt-store-v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const ACTIVE: BookingStatus[] = ["upcoming", "arrived", "completed"];

export function BookingProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [depositRates, setDepositRates] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setBookings(
          (parsed.bookings ?? []).map((b: Partial<Booking>) => ({
            refunded: 0,
            depositRate: DEPOSIT_RATE,
            commissionRate: 0.1,
            ...b,
          })) as Booking[],
        );
        setWaitlist(parsed.waitlist ?? []);
        setDepositRates(parsed.depositRates ?? {});
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ bookings, waitlist, depositRates }));
  }, [bookings, waitlist, depositRates, hydrated]);

  const patch = (id: string, p: Partial<Booking>) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const store: Store = {
    hydrated,
    bookings,
    waitlist,
    addBooking: (b) => {
      const booking: Booking = {
        ...b,
        refunded: 0,
        id: uid(),
        createdAt: Date.now(),
        status: "upcoming",
      };
      setBookings((prev) => [...prev, booking]);
      return booking;
    },
    markArrived: (id) =>
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "arrived", amountPaid: b.total } : b,
        ),
      ),
    completeBooking: (id) => patch(id, { status: "completed" }),
    cancelBooking: (id) => patch(id, { status: "cancelled" }),
    refundBooking: (id) =>
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: "refunded", refunded: b.amountPaid, amountPaid: 0 }
            : b,
        ),
      ),
    joinWaitlist: (e) => setWaitlist((prev) => [...prev, { ...e, id: uid() }]),
    leaveWaitlist: (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id)),
    bookedTimesFor: (barberSlug, dateISO) =>
      bookings
        .filter(
          (b) =>
            b.barberSlug === barberSlug &&
            b.dateISO === dateISO &&
            ACTIVE.includes(b.status),
        )
        .map((b) => b.time),
    depositRateFor: (barberSlug) => depositRates[barberSlug] ?? DEPOSIT_RATE,
    setDepositRate: (barberSlug, rate) =>
      setDepositRates((prev) => ({ ...prev, [barberSlug]: rate })),
  };

  return <BookingContext.Provider value={store}>{children}</BookingContext.Provider>;
}

export function useBookings(): Store {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingProvider");
  return ctx;
}
