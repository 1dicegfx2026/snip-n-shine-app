import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface Booking {
  id: string;
  barberSlug: string;
  serviceId: string;
  dateISO: string;
  time: string;
  name: string;
  payType: "deposit" | "full";
  amountPaid: number;
  total: number;
  createdAt: number;
  status: "upcoming" | "cancelled";
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
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  cancelBooking: (id: string) => void;
  joinWaitlist: (e: Omit<WaitlistEntry, "id">) => void;
  leaveWaitlist: (id: string) => void;
  bookedTimesFor: (barberSlug: string, dateISO: string) => string[];
}

const BookingContext = createContext<Store | null>(null);
const KEY = "gilt-store-v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setBookings(parsed.bookings ?? []);
        setWaitlist(parsed.waitlist ?? []);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ bookings, waitlist }));
  }, [bookings, waitlist, hydrated]);

  const store: Store = {
    hydrated,
    bookings,
    waitlist,
    addBooking: (b) => {
      const booking: Booking = { ...b, id: uid(), createdAt: Date.now(), status: "upcoming" };
      setBookings((prev) => [...prev, booking]);
      return booking;
    },
    cancelBooking: (id) =>
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))),
    joinWaitlist: (e) => setWaitlist((prev) => [...prev, { ...e, id: uid() }]),
    leaveWaitlist: (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id)),
    bookedTimesFor: (barberSlug, dateISO) =>
      bookings
        .filter((b) => b.barberSlug === barberSlug && b.dateISO === dateISO && b.status === "upcoming")
        .map((b) => b.time),
  };

  return <BookingContext.Provider value={store}>{children}</BookingContext.Provider>;
}

export function useBookings(): Store {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingProvider");
  return ctx;
}
