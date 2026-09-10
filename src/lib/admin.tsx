import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type StaffRole = "admin" | "moderator" | "support";

export const STAFF_ROLES: StaffRole[] = ["admin", "moderator", "support"];
export const ROLE_ES: Record<StaffRole, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  support: "Ayudante",
};

export interface AdminUser {
  id: string;
  displayName: string;
  freeAccess: boolean;
  plan: string;
  roles: StaffRole[];
  isAdmin: boolean;
}

interface AdminStore {
  loading: boolean;
  /** admin completo */
  isAdmin: boolean;
  /** admin, moderador o ayudante */
  isStaff: boolean;
  /** puede cambiar cosas (admin o moderador) */
  canEdit: boolean;
  roles: StaffRole[];
  users: AdminUser[];
  refresh: () => Promise<void>;
  claimAdmin: () => Promise<boolean>;
  setFreeAccess: (id: string, value: boolean) => Promise<void>;
  setPlan: (id: string, plan: string) => Promise<void>;
  setAdmin: (id: string, value: boolean) => Promise<void>;
  setRole: (id: string, role: StaffRole, value: boolean) => Promise<void>;
}

export function useAdmin(): AdminStore {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows } = await supabase.from("user_roles").select("user_id, role");
    const all = (rows ?? []) as { user_id: string; role: StaffRole }[];
    const mine = all.filter((r) => r.user_id === user.id).map((r) => r.role);
    setRoles(mine);

    if (mine.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, free_access, plan")
        .order("created_at", { ascending: true });
      setUsers(
        (profiles ?? []).map((p) => {
          const userRoles = all.filter((r) => r.user_id === p.id).map((r) => r.role);
          return {
            id: p.id,
            displayName: p.display_name ?? "Sin nombre",
            freeAccess: Boolean(p.free_access),
            plan: p.plan ?? "free",
            roles: userRoles,
            isAdmin: userRoles.includes("admin"),
          };
        }),
      );
    } else {
      setUsers([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isAdmin = roles.includes("admin");

  const setRole = async (id: string, role: StaffRole, value: boolean) => {
    const result = value
      ? await supabase.from("user_roles").upsert({ user_id: id, role }, { onConflict: "user_id,role" })
      : await supabase.from("user_roles").delete().eq("user_id", id).eq("role", role);
    if (result.error) throw new Error(result.error.message);
    await refresh();
  };

  return {
    loading,
    isAdmin,
    isStaff: roles.length > 0,
    canEdit: isAdmin || roles.includes("moderator"),
    roles,
    users,
    refresh,
    // El admin principal ya está asignado; los demás se nombran desde el panel.
    claimAdmin: async () => false,
    setFreeAccess: async (id, value) => {
      const { error } = await supabase.from("profiles").update({ free_access: value }).eq("id", id);
      if (error) throw new Error(error.message);
      await refresh();
    },
    setPlan: async (id, plan) => {
      const { error } = await supabase.from("profiles").update({ plan }).eq("id", id);
      if (error) throw new Error(error.message);
      await refresh();
    },
    setAdmin: async (id, value) => setRole(id, "admin", value),
    setRole,
  };
}
