import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Explorers — save, track and continue" },
      {
        name: "description",
        content:
          "Create a free Explorers account to save articles, track roadmap and lesson progress, and get recommendations that fit your level.",
      },
      { property: "og:title", content: "Sign in to Explorers" },
      { property: "og:description", content: "Save your path, track progress, pick up where you left off." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, explorer.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <main className="topo flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="focus-ring inline-flex items-center gap-2 text-primary">
          <Compass className="h-5 w-5" aria-hidden />
          <span className="font-display text-lg font-bold tracking-tight">Explorers</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? "Sign in to continue exploring" : "Start your explorer account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save what matters, track roadmap and lesson progress, and get suggestions that match your level.
        </p>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="focus-ring mt-6 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-border-strong disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <label className="block text-sm">
              <span className="text-muted-foreground">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="focus-ring mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none"
                autoComplete="name"
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground outline-none"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          {mode === "signin" ? "New to Explorers?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="focus-ring font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
