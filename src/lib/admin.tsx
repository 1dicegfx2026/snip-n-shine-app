import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface AdminUser {
  id: string;
  displayName: string;
  freeAccess: boolean;
  plan: string;
  isAdmin: boolean;
}

interface AdminStore {
  loading: boolean;
  isAdmin: boolean;
  users: AdminUser[];
  refresh: () => Promise<void>;
  claimAdmin: () => Promise<boolean>;
  setFreeAccess: (id: string, value: boolean) => Promise<void>;
  setPlan: (id: string, plan: string) => Promise<void>;
  setAdmin: (id: string, value: boolean) => Promise<void>;
}

export function useAdmin(): AdminStore {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const admins = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    const mine = admins.has(user.id);
    setIsAdmin(mine);
    if (mine) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, free_access, plan")
        .order("created_at", { ascending: true });
      setUsers(
        (profiles ?? []).map((p) => ({
          id: p.id,
          displayName: p.display_name ?? "Sin nombre",
          freeAccess: Boolean(p.free_access),
          plan: p.plan ?? "free",
          isAdmin: admins.has(p.id),
        })),
      );
    } else {
      setUsers([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    loading,
    isAdmin,
    users,
    refresh,
    claimAdmin: async () => {
      const { data, error } = await supabase.rpc("claim_admin");
      if (error || !data) return false;
      await refresh();
      return true;
    },
    setFreeAccess: async (id, value) => {
      await supabase.from("profiles").update({ free_access: value }).eq("id", id);
      await refresh();
    },
    setPlan: async (id, plan) => {
      await supabase.from("profiles").update({ plan }).eq("id", id);
      await refresh();
    },
    setAdmin: async (id, value) => {
      if (value) await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
      else await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
      await refresh();
    },
  };
}
