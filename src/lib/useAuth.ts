import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Profile } from "./content";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isEditor: boolean;
  isAdmin: boolean;
  refresh: () => void;
};

export function useAuth(): AuthState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);
      if (cancelled) return;
      setProfile((p.data ?? null) as Profile | null);
      setRoles(((r.data ?? []) as { role: AppRole }[]).map((row) => row.role));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, tick]);

  const isAdmin = roles.includes("admin") || roles.includes("super_admin");

  return {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isEditor: isAdmin || roles.includes("editor"),
    isAdmin,
    refresh: () => setTick((t) => t + 1),
  };
}
