import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Search, UserPlus, X } from "lucide-react";
import { Wordmark, LogoMark } from "@/components/site/Logo";
import { useAuth } from "@/lib/useAuth";
import { AssistantDock } from "@/components/assistant/AssistantDock";
import { ReferralDialog } from "@/components/referral/LockedCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

/** Paths a signed-out visitor may browse; everything else asks them to join. */
const PUBLIC_PATHS = ["/", "/auth"];

/**
 * Signed-out visitors get the landing page; the moment they open any other
 * section we send them to sign up / sign in (client-side, so SSR is untouched).
 */
function GuestRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading || user) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (isPublic) return;
    void navigate({ to: "/auth", replace: true });
  }, [loading, user, pathname, navigate]);

  return null;
}


const NAV = [
  { to: "/", label: "Discover" },
  { to: "/articles", label: "Articles" },
  { to: "/roadmaps", label: "Roadmaps & Careers" },
  { to: "/resources", label: "Resources" },
  { to: "/opportunities", label: "Opportunities & Updates" },
  { to: "/problems", label: "Problems", soon: true },
] as const;

function SiteLayout() {
  const navigate = useNavigate();
  const { user, isEditor } = useAuth();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate({ to: "/search", search: { q } });
    setOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="focus-ring flex items-center gap-2">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary bg-primary/10" }}
                className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                {"soon" in item && item.soon && (
                  <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="ml-auto hidden md:block" role="search">
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Search Explorers</span>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search anything…"
                className="focus-ring w-52 rounded-md border border-border bg-surface/60 py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>
          </form>

          <div className="hidden items-center gap-2 md:flex">
            {isEditor && (
              <Link
                to="/studio"
                className="focus-ring rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Studio
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="focus-ring rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Profile
                </Link>
                <Link
                  to="/library"
                  className="focus-ring rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Library
                </Link>
                <button
                  type="button"
                  onClick={() => void supabase.auth.signOut()}
                  className="focus-ring rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="focus-ring rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="focus-ring ml-auto rounded-md border border-border p-2 text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}>
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <form onSubmit={submitSearch} role="search" className="mb-3">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search anything…"
                className="focus-ring w-full rounded-md border border-border bg-surface/60 px-3 py-2 text-sm"
              />
            </form>
            <nav aria-label="Mobile" className="grid grid-cols-2 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              {isEditor && (
                <Link to="/studio" onClick={() => setOpen(false)} className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-primary">
                  Studio
                </Link>
              )}
              {user && (
                <Link to="/profile" onClick={() => setOpen(false)} className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-primary">
                  Profile
                </Link>
              )}
              <Link
                to={user ? "/library" : "/auth"}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-md px-2.5 py-2 text-sm font-medium text-primary"
              >
                {user ? "Library" : "Sign in"}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <ProfilePrompt />

      <main id="main" className="flex-1">
        {/* Required: nested routes render here. */}
        <Outlet />
      </main>

      <AssistantDock />
      <ReferralDialog />

      <footer className="border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <LogoMark className="h-7 w-7" />
                <span className="font-display text-base font-bold text-foreground">Explorers</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                A global discovery platform for AI and technology. Understand what's changing, learn
                the skills, build the proof.
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Explore</p>
              <ul className="mt-3 space-y-2 text-sm">
                {NAV.slice(1, 4).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="focus-ring text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Grow</p>
              <ul className="mt-3 space-y-2 text-sm">
                {NAV.slice(4).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="focus-ring text-muted-foreground hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/library" className="focus-ring text-muted-foreground hover:text-foreground">
                    Your library
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Principles</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Free-first, verified resources</li>
                <li>Clarity over hype</li>
                <li>Every page leads somewhere</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Explorers. Built for students, self-learners and builders
            everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Shown at the top of every page while a signed-in explorer still has an
 * empty profile — they can skip it at sign-up, so it keeps nudging.
 */
function ProfilePrompt() {
  const { user, profile, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  if (loading || !user || dismissed) return null;
  const complete = Boolean(profile?.headline || profile?.bio || (profile?.skills?.length ?? 0) > 0);
  if (complete) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <UserPlus className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-foreground">
          Your profile is still empty — add a headline and skills so others see what you explore.
        </p>
        <Link
          to="/profile"
          className="focus-ring ml-auto rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          Create profile
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="focus-ring rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Later
        </button>
      </div>
    </div>
  );
}
