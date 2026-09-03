import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Compass, Github, Globe, Linkedin, MapPin, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { activityQuery, mySubmissionsQuery } from "@/lib/community";
import { EmptyState, PageHeader, Pill } from "@/components/site/bits";
import { useAccess } from "@/lib/referral";

export const Route = createFileRoute("/_site/profile")({
  head: () => ({
    meta: [
      { title: "Your explorer profile | Explorers" },
      {
        name: "description",
        content:
          "Your Explorers profile: headline, skills, the problems and projects you posted, and everything you explored on the platform.",
      },
      { property: "og:title", content: "Your explorer profile" },
      {
        property: "og:description",
        content: "A living profile built from what you explore, submit and build on Explorers.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, loading, refresh, isAdmin } = useAuth();
  const { invited } = useAccess();
  const activity = useQuery(activityQuery(user?.id)).data ?? [];
  const submissions = useQuery(mySubmissionsQuery(user?.id)).data ?? [];
  const [editing, setEditing] = useState(false);

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">Loading…</p>;
  }

  if (!user) {
    return (
      <>
        <PageHeader eyebrow="Profile" title="Your explorer profile" description="Sign in to build it." />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-display text-base font-semibold text-foreground">Sign in first</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your profile shows what you explored, plus the problems and projects you posted.
            </p>
            <Link
              to="/auth"
              className="focus-ring mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Sign in
            </Link>
          </div>
        </div>
      </>
    );
  }

  const name = profile?.display_name || user.email?.split("@")[0] || "Explorer";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Cover + identity */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="aurora h-28 w-full bg-primary/15" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-primary font-display text-2xl font-bold text-primary-foreground">
              {initials}
            </span>
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing ? "Close" : "Edit profile"}
            </button>
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">{name}</h1>
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {profile?.headline || "Add a headline — what you're exploring and building"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {profile?.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {profile.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" aria-hidden /> {activity.length} explored ·{" "}
              {submissions.length} posted · {invited} invited
            </span>
            {isAdmin && <Pill tone="primary">admin</Pill>}
          </div>
          {profile?.bio && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}
          {(profile?.skills?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile!.skills.map((skill) => (
                <Pill key={skill}>{skill}</Pill>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <ProfileLink href={profile?.website_url} icon={<Globe className="h-3.5 w-3.5" />} label="Website" />
            <ProfileLink href={profile?.github_url} icon={<Github className="h-3.5 w-3.5" />} label="GitHub" />
            <ProfileLink href={profile?.linkedin_url} icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-6">
          <ProfileEditor
            userId={user.id}
            onSaved={() => {
              refresh();
              setEditing(false);
            }}
          />
        </div>
      )}

      {/* Explored */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-foreground">What you explored</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatically built from the roadmaps, articles and resources you opened here.
        </p>
        {activity.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing yet" hint="Open a roadmap or article and it shows up here." />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {activity.map((row) => (
              <li key={row.id}>
                <a
                  href={row.path}
                  className="focus-ring flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-surface/60"
                >
                  <span className="font-display text-[0.975rem] font-semibold text-foreground">{row.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Pill>{row.item_type.replace(/_/g, " ")}</Pill>
                    <span className="eyebrow text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Submissions */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Your problems & projects</h2>
          <Link to="/problems" className="focus-ring text-sm font-semibold text-primary hover:underline">
            Submit new
          </Link>
        </div>
        {submissions.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing posted yet" hint="Share a problem you keep hitting, or a project you built." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {submissions.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{item.kind}</Pill>
                  <Pill>{item.status}</Pill>
                </div>
                <h3 className="mt-2.5 font-display text-base font-semibold text-foreground">{item.title}</h3>
                {item.summary && <p className="mt-1.5 text-sm text-muted-foreground">{item.summary}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileLink({ href, icon, label }: { href?: string | null; icon: React.ReactNode; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
    >
      {icon} {label}
    </a>
  );
}

function ProfileEditor({ userId, onSaved }: { userId: string; onSaved: () => void }) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    headline: "",
    location: "",
    bio: "",
    skills: "",
    website_url: "",
    github_url: "",
    linkedin_url: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      skills: (profile.skills ?? []).join(", "),
      website_url: profile.website_url ?? "",
      github_url: profile.github_url ?? "",
      linkedin_url: profile.linkedin_url ?? "",
    });
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: form.display_name.trim() || null,
      headline: form.headline.trim() || null,
      location: form.location.trim() || null,
      bio: form.bio.trim() || null,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      website_url: form.website_url.trim() || null,
      github_url: form.github_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile"] });
    onSaved();
  }

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <form onSubmit={save} className="rounded-xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Text label="Name" value={form.display_name} onChange={set("display_name")} />
        <Text label="Headline" value={form.headline} onChange={set("headline")} placeholder="AI student building agents" />
        <Text label="Location" value={form.location} onChange={set("location")} />
        <Text label="Skills (comma separated)" value={form.skills} onChange={set("skills")} />
        <Text label="Website" value={form.website_url} onChange={set("website_url")} placeholder="https://" />
        <Text label="GitHub" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/…" />
        <Text label="LinkedIn" value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" />
      </div>
      <label className="mt-3 block">
        <span className="eyebrow text-muted-foreground">About</span>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio")(e.target.value)}
          rows={4}
          className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
        />
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="focus-ring mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}
