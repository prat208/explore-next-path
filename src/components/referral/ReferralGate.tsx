import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { REFERRALS_NEEDED, referralLink, useAccess } from "@/lib/referral";
import { cn } from "@/lib/utils";

/**
 * Shown at the bottom of a gated section: explains what is still hidden and
 * gives the explorer their invite link. Three unique signups unlock everything.
 */
export function ReferralGate({
  label,
  hidden,
  className,
}: {
  /** Plural noun for the section, e.g. "roadmaps". */
  label: string;
  /** How many items are currently locked away. */
  hidden: number;
  className?: string;
}) {
  const { signedIn, unlocked, invited, remaining, code, loading } = useAccess();
  const [copied, setCopied] = useState(false);

  if (loading || unlocked) return null;

  const link = referralLink(code);

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the link and copy it manually");
    }
  }

  return (
    <section
      className={cn(
        "aurora relative mt-10 overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8",
        className,
      )}
      aria-labelledby="referral-gate-title"
    >
      <p className="eyebrow inline-flex items-center gap-1.5 text-primary">
        <Lock className="h-3.5 w-3.5" aria-hidden /> Locked for now
      </p>
      <h2 id="referral-gate-title" className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {hidden > 0
          ? `${hidden} more ${label} are waiting behind your invites`
          : `Unlock every ${label} on Explorers`}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every new explorer starts with one free pick in each section. Invite {REFERRALS_NEEDED} people
        who create an account through your link and all roadmaps, resources, updates and opportunities
        open up permanently.
      </p>

      {signedIn ? (
        <>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {Array.from({ length: REFERRALS_NEEDED }).map((_, i) => (
                <span
                  key={i}
                  className={cn("h-2 w-10 rounded-full", i < invited ? "bg-primary" : "bg-border")}
                />
              ))}
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" aria-hidden />
              {invited} of {REFERRALS_NEEDED} joined — {remaining} to go
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="focus-ring flex-1 truncate rounded-xl border border-border bg-surface/60 px-3 py-2.5 font-mono text-xs text-foreground">
              {link || "Preparing your invite link…"}
            </code>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!link}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy invite link"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/auth"
            className="focus-ring rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            Create a free account
          </Link>
          <Link
            to="/auth"
            className="focus-ring rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            I already have one
          </Link>
        </div>
      )}
    </section>
  );
}
