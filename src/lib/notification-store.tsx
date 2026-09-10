import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: number;
}

interface Store {
  notifications: AppNotification[];
  unread: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

interface Row {
  id: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

/** Crea una notificación para un usuario. Se puede llamar fuera de React. */
export async function pushNotification(input: {
  userId: string;
  title: string;
  body?: string;
  link?: string;
}) {
  await supabase.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    body: input.body ?? "",
    link: input.link ?? "",
  });
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setNotifications(
        (data as unknown as Row[]).map((r) => ({
          id: r.id,
          title: r.title,
          body: r.body,
          link: r.link,
          read: r.read,
          createdAt: new Date(r.created_at).getTime(),
        })),
      );
    }
  };

  useEffect(() => {
    if (loading) return;
    void refresh();
    if (!user) return;
    const channel = supabase
      .channel("notifications-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loading]);

  const store: Store = {
    notifications,
    unread: notifications.filter((n) => !n.read).length,
    refresh,
    markRead: async (id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    markAllRead: async () => {
      if (!user) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useNotifications(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
