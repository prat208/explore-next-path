import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReferralGate } from "@/components/referral/ReferralGate";
import { REFERRALS_NEEDED } from "@/lib/referral";
import { cn } from "@/lib/utils";

const EVENT = "explorers:referral-gate";

/** Opens the invite dialog from anywhere (e.g. a click on a locked card). */
export function openReferralDialog() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/**
 * Wraps a listing card. When `locked` the card stays visible but is dimmed
 * behind a lock badge; clicking it opens the referral dialog instead of navigating.
 */
export function LockedCard({
  locked,
  children,
  className,
}: {
  locked: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className={cn("relative h-full", className)}>
      <div className="pointer-events-none h-full select-none opacity-45 blur-[2px]" aria-hidden>
        {children}
      </div>
      <button
        type="button"
        onClick={openReferralDialog}
        className="focus-ring absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-background/45 px-4 text-center backdrop-blur-[1px] transition-colors hover:bg-background/25"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-display text-sm font-semibold text-foreground">Locked</span>
        <span className="text-xs text-muted-foreground">
          Invite {REFERRALS_NEEDED} explorers to unlock
        </span>
      </button>
    </div>
  );
}

/** Mounted once in the site layout; shows the invite link when a locked card is clicked. */
export function ReferralDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">This one is locked for now</DialogTitle>
          <DialogDescription>
            Share your invite link — {REFERRALS_NEEDED} signups open every roadmap, resource, update
            and opportunity permanently.
          </DialogDescription>
        </DialogHeader>
        <ReferralGate label="items" hidden={0} className="mt-0" />
      </DialogContent>
    </Dialog>
  );
}
