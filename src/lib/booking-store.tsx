import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEPOSIT_RATE, getBarber } from "@/lib/data/barbers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type BookingStatus = "upcoming" | "arrived" | "completed" | "cancelled" | "refunded";

export interface Booking {
  id: string;
  clientId: string | null;
  barberSlug: string;
  serviceId: string;
  dateISO: string;
  time: string;
  name: string;
  payType: "deposit" | "full";
  payMethod?: string | undefined;
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
    b: Omit<Booking, "id" | "createdAt" | "status" | "refunded" | "clientId">,
  ) => Booking;
  updateBooking: (
    id: string,
    patch: Partial<Pick<Booking, "serviceId" | "dateISO" | "time" | "name" | "payType" | "payMethod">>,
  ) => Promise<void>;
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

const ACTIVE: BookingStatus[] = ["upcoming", "arrived", "completed"];

interface Row {
  id: string;
  client_id: string | null;
  barber_slug: string;
  service_id: string;
  date_iso: string;
  time: string;
  name: string;
  pay_type: string;
  pay_method: string | null;
  deposit_rate: number | string;
  commission_rate: number | string;
  amount_paid: number | string;
  refunded: number | string;
  total: number | string;
  status: string;
  created_at: string;
}

const n = (v: number | string) => (typeof v === "number" ? v : Number(v));

function fromRow(r: Row): Booking {
  return {
    id: r.id,
    clientId: r.client_id,
    barberSlug: r.barber_slug,
    serviceId: r.service_id,
    dateISO: r.date_iso,
    time: r.time,
    name: r.name,
    payType: (r.pay_type as Booking["payType"]) ?? "deposit",
    payMethod: r.pay_method ?? undefined,
    depositRate: n(r.deposit_rate),
    commissionRate: n(r.commission_rate),
    amountPaid: n(r.amount_paid),
    refunded: n(r.refunded),
    total: n(r.total),
    createdAt: new Date(r.created_at).getTime(),
    status: (r.status as BookingStatus) ?? "upcoming",
  };
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [depositRates, setDepositRates] = useState<Record<string, number>>({});

  const loadRates = async () => {
    const { data } = await supabase.from("pro_pages").select("handle, deposit_rate");
    if (data) {
      const map: Record<string, number> = {};
      for (const row of data as { handle: string; deposit_rate: number | string }[]) {
        map[row.handle] = n(row.deposit_rate);
      }
      setDepositRates(map);
    }
  };

  const load = async () => {
    const [b, w] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: true }),
      supabase.from("waitlist").select("*"),
    ]);
    if (b.data) setBookings((b.data as unknown as Row[]).map(fromRow));
    if (w.data) {
      setWaitlist(
        (w.data as unknown as { id: string; barber_slug: string; date_iso: string; time: string }[]).map(
          (r) => ({ id: r.id, barberSlug: r.barber_slug, dateISO: r.date_iso, time: r.time }),
        ),
      );
    }
    setHydrated(true);
  };

  useEffect(() => {
    if (loading) return;
    void loadRates();
    if (!user) {
      setBookings([]);
      setWaitlist([]);
      setHydrated(true);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("gilt-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const patch = (
    id: string,
    p: Partial<Booking>,
    dbPatch: { status?: string; amount_paid?: number; refunded?: number },
  ) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...p } : b)));
    void supabase.from("bookings").update(dbPatch).eq("id", id);
  };

  const store: Store = {
    hydrated,
    bookings,
    waitlist,
    addBooking: (b) => {
      const booking: Booking = {
        ...b,
        clientId: user?.id ?? null,
        refunded: 0,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        status: "upcoming",
      };
      setBookings((prev) => [...prev, booking]);
      void (async () => {
        const { error } = await supabase.from("bookings").insert({
        id: booking.id,
        client_id: user?.id ?? null,
        barber_slug: booking.barberSlug,
        service_id: booking.serviceId,
        date_iso: booking.dateISO,
        time: booking.time,
        name: booking.name,
        pay_type: booking.payType,
        pay_method: booking.payMethod ?? null,
        deposit_rate: booking.depositRate,
        commission_rate: booking.commissionRate,
        amount_paid: booking.amountPaid,
        refunded: 0,
        total: booking.total,
          status: "upcoming",
        });
        if (error) console.error("booking insert failed", error.message, error.details);
      })();
      return booking;
    },
    updateBooking: async (id, patch) => {
      const dbPatch: Record<string, string | null> = {};
      if (patch.serviceId !== undefined) dbPatch.service_id = patch.serviceId;
      if (patch.dateISO !== undefined) dbPatch.date_iso = patch.dateISO;
      if (patch.time !== undefined) dbPatch.time = patch.time;
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.payType !== undefined) dbPatch.pay_type = patch.payType;
      if (patch.payMethod !== undefined) dbPatch.pay_method = patch.payMethod ?? null;
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const next = { ...b, ...patch };
          const svc = patch.serviceId ? undefined : b.serviceId;
          const barberSlug = b.barberSlug;
          const barber = (await import("@/lib/data/barbers")).getBarber(barberSlug);
          const service = barber?.services.find((s) => s.id === next.serviceId);
          if (service) next.total = service.price;
          return next;
        }),
      );
      const { error } = await supabase.from("bookings").update(dbPatch).eq("id", id);
      if (error) console.error("booking update failed", error.message);
    },
    markArrived: (id) => {
      const b = bookings.find((x) => x.id === id);
      const total = b?.total ?? 0;
      patch(id, { status: "arrived", amountPaid: total }, { status: "arrived", amount_paid: total });
    },
    completeBooking: (id) => patch(id, { status: "completed" }, { status: "completed" }),
    cancelBooking: (id) => patch(id, { status: "cancelled" }, { status: "cancelled" }),
    refundBooking: (id) => {
      const b = bookings.find((x) => x.id === id);
      const paid = b?.amountPaid ?? 0;
      patch(
        id,
        { status: "refunded", refunded: paid, amountPaid: 0 },
        { status: "refunded", refunded: paid, amount_paid: 0 },
      );
    },
    joinWaitlist: (e) => {
      const entry: WaitlistEntry = { ...e, id: crypto.randomUUID() };
      setWaitlist((prev) => [...prev, entry]);
      void supabase.from("waitlist").insert({
        id: entry.id,
        client_id: user?.id ?? null,
        barber_slug: entry.barberSlug,
        date_iso: entry.dateISO,
        time: entry.time,
      });
    },
    leaveWaitlist: (id) => {
      setWaitlist((prev) => prev.filter((w) => w.id !== id));
      void supabase.from("waitlist").delete().eq("id", id);
    },
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
    setDepositRate: (barberSlug, rate) => {
      setDepositRates((prev) => ({ ...prev, [barberSlug]: rate }));
      void supabase.from("pro_pages").update({ deposit_rate: rate }).eq("handle", barberSlug);
    },
  };

  return <BookingContext.Provider value={store}>{children}</BookingContext.Provider>;
}

export function useBookings(): Store {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingProvider");
  return ctx;
}
