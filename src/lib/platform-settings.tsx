import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  commissionRate: number;
  defaultDepositRate: number;
  payCard: boolean;
  payZelle: boolean;
  payCashapp: boolean;
  payCash: boolean;
  announcement: string;
  supportEmail: string;
  bookingsOpen: boolean;
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  commissionRate: 0.1,
  defaultDepositRate: 0.25,
  payCard: true,
  payZelle: true,
  payCashapp: true,
  payCash: true,
  announcement: "",
  supportEmail: "",
  bookingsOpen: true,
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();
    if (data) {
      setSettings({
        commissionRate: Number(data.commission_rate),
        defaultDepositRate: Number(data.default_deposit_rate),
        payCard: data.pay_card,
        payZelle: data.pay_zelle,
        payCashapp: data.pay_cashapp,
        payCash: data.pay_cash,
        announcement: data.announcement ?? "",
        supportEmail: data.support_email ?? "",
        bookingsOpen: data.bookings_open,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (patch: Partial<PlatformSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    const { error } = await supabase.from("platform_settings").upsert({
      id: "main",
      commission_rate: next.commissionRate,
      default_deposit_rate: next.defaultDepositRate,
      pay_card: next.payCard,
      pay_zelle: next.payZelle,
      pay_cashapp: next.payCashapp,
      pay_cash: next.payCash,
      announcement: next.announcement,
      support_email: next.supportEmail,
      bookings_open: next.bookingsOpen,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      await refresh();
      throw new Error(error.message);
    }
  };

  return { settings, loading, refresh, save };
}
