import { useEffect } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const REFERRALS_NEEDED = 3;
/** How many items each gated section shows before full access is unlocked. */
export const FREE_PREVIEW_COUNT = 1;

const STORAGE_KEY = "explorers.ref";

export type ReferralStats = { code: string | null; invited: number; unlocked: boolean };

export function referralStatsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["referral-stats", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ReferralStats> => {
      const { data, error } = await supabase.rpc("referral_stats");
      if (error) throw new Error(error.message);
      const row = (data ?? {}) as Partial<ReferralStats>;
      return {
        code: row.code ?? null,
        invited: Number(row.invited ?? 0),
        unlocked: Boolean(row.unlocked),
      };
    },
  });
}

export function referralLink(code: string | null): string {
  if (typeof window === "undefined" || !code) return "";
  return `${window.location.origin}/auth?ref=${code}`;
}

/** Captures ?ref=CODE from the URL so it survives until the visitor signs up. */
export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const code = new URLSearchParams(window.location.search).get("ref");
  if (code && code.trim()) window.localStorage.setItem(STORAGE_KEY, code.trim().toUpperCase());
}

/**
 * Access state for gated sections. Also makes sure the signed-in explorer has an
 * invite code and that any pending referral code is credited to the inviter.
 */
export function useAccess() {
  const { user, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const stats = useQuery(referralStatsQuery(userId));

  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const pending = window.localStorage.getItem(STORAGE_KEY);
      if (pending) {
        const { data } = await supabase.rpc("claim_referral", { _code: pending });
        window.localStorage.removeItem(STORAGE_KEY);
        if (data === true && !cancelled) {
          void qc.invalidateQueries({ queryKey: ["referral-stats"] });
        }
      }
      if (!stats.data?.code) {
        await supabase.rpc("ensure_referral_code");
        if (!cancelled) void qc.invalidateQueries({ queryKey: ["referral-stats", userId] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, stats.data?.code, qc]);

  const invited = stats.data?.invited ?? 0;

  return {
    signedIn: Boolean(userId),
    loading: authLoading || (Boolean(userId) && stats.isLoading),
    invited,
    remaining: Math.max(0, REFERRALS_NEEDED - invited),
    code: stats.data?.code ?? null,
    /** Full library access: signed in and invited enough explorers. */
    unlocked: Boolean(userId) && Boolean(stats.data?.unlocked),
  };
}

/** Trims a list down to the teaser size until access is unlocked. */
export function gateList<T>(items: T[], unlocked: boolean, free = FREE_PREVIEW_COUNT): T[] {
  return unlocked ? items : items.slice(0, free);
}
