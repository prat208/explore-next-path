import markUrl from "@/assets/explorers-mark.png";
import { cn } from "@/lib/utils";

/**
 * The Explorers brand mark — the angular explorer arrow, extracted from the
 * original lockup as a transparent PNG so it reads cleanly at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={markUrl}
      alt=""
      aria-hidden
      className={cn("block h-9 w-9 shrink-0 object-contain", className)}
    />
  );
}

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={size === "sm" ? "h-8 w-8" : "h-10 w-10"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            size === "sm" ? "text-base" : "text-lg",
          )}
        >
          EXPLORERS
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Explore to Excel
        </span>
      </span>
    </span>
  );
}
