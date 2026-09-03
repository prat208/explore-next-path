import logoAsset from "@/assets/explorers-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

/**
 * The Explorers brand mark. The source artwork is a wide lockup on paper, so
 * the mark itself is isolated with a clipped, scaled crop — no stretching.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block shrink-0 overflow-hidden rounded-md bg-surface ring-1 ring-border",
        className,
      )}
    >
      <span
        className="block h-full w-full"
        style={{
          backgroundImage: `url(${logoAsset.url})`,
          backgroundSize: "370% 370%",
          backgroundPosition: "48% 28%",
          backgroundRepeat: "no-repeat",
        }}
      />
    </span>
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
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark className={size === "sm" ? "h-7 w-7" : "h-9 w-9"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-bold tracking-tight text-foreground",
            size === "sm" ? "text-base" : "text-lg",
          )}
        >
          EXPLORERS
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Explore to Excel
        </span>
      </span>
    </span>
  );
}
