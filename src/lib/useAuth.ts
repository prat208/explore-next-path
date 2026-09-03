import { useEffect, useSyncExternalStore } from "react";
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

type Snapshot = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
};

/**
 * One shared auth store for the whole app. Every component used to run its own
 * session listener plus profile/role queries, so a single page navigation fired
 * the same requests five or six times — that was the visible lag. Now the
 * session is fetched once and every consumer reads the same snapshot.
 */
const EMPTY: Snapshot = { loading: true, session: null, profile: null, roles: [] };

let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();
let started = false;
let loadedFor: string | null = null;
let inFlight: Promise<void> | null = null;

function set(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

async function loadIdentity(userId: string, force = false) {
  if (!force && loadedFor === userId) return;
  if (inFlight && !force) return inFlight;
  inFlight = (async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    if (snapshot.session?.user?.id !== userId) return;
    loadedFor = userId;
    set({
      profile: (p.data ?? null) as Profile | null,
      roles: ((r.data ?? []) as { role: AppRole }[]).map((row) => row.role),
    });
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function applySession(session: Session | null) {
  const sameUser = snapshot.session?.user?.id === session?.user?.id;
  set({ session, loading: false });
  if (!session?.user) {
    loadedFor = null;
    if (!sameUser) set({ profile: null, roles: [] });
    return;
  }
  void loadIdentity(session.user.id);
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  supabase.auth.onAuthStateChange((_event, next) => applySession(next));
  void supabase.auth.getSession().then(({ data }) => applySession(data.session));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => EMPTY;

export function useAuth(): AuthState {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    start();
  }, []);

  const isAdmin = state.roles.includes("admin") || state.roles.includes("super_admin");

  return {
    loading: state.loading,
    session: state.session,
    user: state.session?.user ?? null,
    profile: state.profile,
    roles: state.roles,
    isEditor: isAdmin || state.roles.includes("editor"),
    isAdmin,
    refresh: () => {
      const id = snapshot.session?.user?.id;
      if (id) void loadIdentity(id, true);
    },
  };
}
