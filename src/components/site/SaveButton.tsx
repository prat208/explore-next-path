import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function SaveButton({
  itemType,
  itemId,
  label = "Save",
  className,
}: {
  itemType: string;
  itemId: string;
  label?: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      if (cancelled) return;
      setUserId(id);
      if (!id) return;
      const { data: rows } = await supabase
        .from("user_saves")
        .select("id")
        .eq("user_id", id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();
      if (!cancelled) setSaved(Boolean(rows));
    })();
    return () => {
      cancelled = true;
    };
  }, [itemType, itemId]);

  async function toggle() {
    if (!userId) {
      toast.error("Sign in to save this", { description: "Your library syncs across devices." });
      return;
    }
    setBusy(true);
    if (saved) {
      await supabase
        .from("user_saves")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      setSaved(false);
      toast("Removed from your library");
    } else {
      await supabase.from("user_saves").insert({ user_id: userId, item_type: itemType, item_id: itemId });
      await supabase
        .from("user_activity")
        .insert({ user_id: userId, kind: "save", item_type: itemType, item_id: itemId });
      setSaved(true);
      toast.success("Saved to your library");
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      className={cn(
        "focus-ring inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        saved
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      {saved ? "Saved" : label}
    </button>
  );
}
