import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Compass,
  GraduationCap,
  Github,
  Globe,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Twitter,
} from "lucide-react";
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
          "Your Explorers profile: headline, experience, education, certifications, skills, the problems and projects you posted, and everything you explored.",
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

/** A repeatable timeline entry — used for experience, education, certs, awards. */
type Entry = {
  title: string;
  org: string;
  start: string;
  end: string;
  location: string;
  description: string;
  url: string;
};

const EMPTY_ENTRY: Entry = { title: "", org: "", start: "", end: "", location: "", description: "", url: "" };

const OPEN_TO = [
  "Internships",
  "Full-time roles",
  "Freelance",
  "Hackathon teammates",
  "Open source",
  "Mentoring",
  "Being mentored",
  "Research",
] as const;

function toEntries(value: unknown): Entry[] {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => ({ ...EMPTY_ENTRY, ...(raw as Partial<Entry>) }));
}

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
              Your profile shows your experience, education and skills, plus everything you explored here.
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
  const experience = toEntries(profile?.experience);
  const education = toEntries(profile?.education);
  const certifications = toEntries(profile?.certifications);
  const achievements = toEntries(profile?.achievements);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Cover + identity */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="aurora h-32 w-full bg-primary/15"
          style={
            profile?.banner_url
              ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex items-end justify-between gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-20 w-20 rounded-2xl border-4 border-card object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-primary font-display text-2xl font-bold text-primary-foreground">
                {initials}
              </span>
            )}
            <button
              type="button"
              onClick={() => setEditing((e) => !e)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing ? "Close" : "Edit profile"}
            </button>
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
            {name}
            {profile?.pronouns && (
              <span className="ml-2 align-middle text-sm font-medium text-muted-foreground">
                ({profile.pronouns})
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {profile?.headline || "Add a headline — what you're exploring and building"}
          </p>
          {(profile?.role_title || profile?.current_company) && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" aria-hidden />
              {[profile?.role_title, profile?.current_company].filter(Boolean).join(" · ")}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {profile?.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {profile.location}
              </span>
            )}
            {profile?.industry && <Pill>{profile.industry}</Pill>}
            <span className="inline-flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" aria-hidden /> {activity.length} explored ·{" "}
              {submissions.length} posted · {invited} invited
            </span>
            {isAdmin && <Pill tone="primary">admin</Pill>}
          </div>

          {(profile?.open_to?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile!.open_to.map((item) => (
                <Pill key={item} tone="primary">
                  Open to: {item}
                </Pill>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <ProfileLink href={profile?.website_url} icon={<Globe className="h-3.5 w-3.5" />} label="Website" />
            <ProfileLink href={profile?.portfolio_url} icon={<Sparkles className="h-3.5 w-3.5" />} label="Portfolio" />
            <ProfileLink href={profile?.github_url} icon={<Github className="h-3.5 w-3.5" />} label="GitHub" />
            <ProfileLink href={profile?.linkedin_url} icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
            <ProfileLink href={profile?.twitter_url} icon={<Twitter className="h-3.5 w-3.5" />} label="X / Twitter" />
            <ProfileLink
              href={profile?.contact_email ? `mailto:${profile.contact_email}` : null}
              icon={<Mail className="h-3.5 w-3.5" />}
              label={profile?.contact_email ?? "Email"}
            />
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

      {/* About */}
      {profile?.bio && (
        <Section title="About">
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
        </Section>
      )}

      {/* Skills + languages */}
      {((profile?.skills?.length ?? 0) > 0 || (profile?.languages?.length ?? 0) > 0) && (
        <Section title="Skills & languages">
          <div className="flex flex-wrap gap-2">
            {(profile?.skills ?? []).map((skill) => (
              <Pill key={skill}>{skill}</Pill>
            ))}
          </div>
          {(profile?.languages?.length ?? 0) > 0 && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Languages className="h-3.5 w-3.5" aria-hidden /> {profile!.languages.join(", ")}
            </p>
          )}
        </Section>
      )}

      <EntryList title="Experience" icon={<Briefcase className="h-4 w-4" />} entries={experience} />
      <EntryList title="Education" icon={<GraduationCap className="h-4 w-4" />} entries={education} />
      <EntryList title="Certifications" icon={<Award className="h-4 w-4" />} entries={certifications} />
      <EntryList title="Achievements" icon={<Sparkles className="h-4 w-4" />} entries={achievements} />

      {/* Explored */}
      <section className="mt-10">
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
            Problems hub
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EntryList({ title, icon, entries }: { title: string; icon: React.ReactNode; entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <span className="text-primary" aria-hidden>
          {icon}
        </span>
        {title}
      </h2>
      <ol className="mt-4 space-y-5">
        {entries.map((entry, i) => (
          <li key={`${entry.title}-${i}`} className="border-l-2 border-border pl-4">
            <p className="font-display text-[0.975rem] font-semibold text-foreground">{entry.title}</p>
            {(entry.org || entry.location) && (
              <p className="text-sm text-foreground/80">{[entry.org, entry.location].filter(Boolean).join(" · ")}</p>
            )}
            {(entry.start || entry.end) && (
              <p className="eyebrow mt-0.5 text-muted-foreground">
                {[entry.start, entry.end || "Present"].filter(Boolean).join(" — ")}
              </p>
            )}
            {entry.description && (
              <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">{entry.description}</p>
            )}
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
                className="focus-ring mt-1 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                View
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProfileLink({ href, icon, label }: { href: string | null | undefined; icon: React.ReactNode; label: string }) {
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
    pronouns: "",
    headline: "",
    role_title: "",
    current_company: "",
    industry: "",
    location: "",
    bio: "",
    skills: "",
    languages: "",
    website_url: "",
    portfolio_url: "",
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
    contact_email: "",
    avatar_url: "",
    banner_url: "",
  });
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [experience, setExperience] = useState<Entry[]>([]);
  const [education, setEducation] = useState<Entry[]>([]);
  const [certifications, setCertifications] = useState<Entry[]>([]);
  const [achievements, setAchievements] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name ?? "",
      pronouns: profile.pronouns ?? "",
      headline: profile.headline ?? "",
      role_title: profile.role_title ?? "",
      current_company: profile.current_company ?? "",
      industry: profile.industry ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      skills: (profile.skills ?? []).join(", "),
      languages: (profile.languages ?? []).join(", "),
      website_url: profile.website_url ?? "",
      portfolio_url: profile.portfolio_url ?? "",
      github_url: profile.github_url ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      twitter_url: profile.twitter_url ?? "",
      contact_email: profile.contact_email ?? "",
      avatar_url: profile.avatar_url ?? "",
      banner_url: profile.banner_url ?? "",
    });
    setOpenTo(profile.open_to ?? []);
    setExperience(toEntries(profile.experience));
    setEducation(toEntries(profile.education));
    setCertifications(toEntries(profile.certifications));
    setAchievements(toEntries(profile.achievements));
  }, [profile]);

  const list = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const clean = (entries: Entry[]) => entries.filter((e) => e.title.trim() || e.org.trim());

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const text = (v: string) => v.trim() || null;
    const { error: err } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: text(form.display_name),
      pronouns: text(form.pronouns),
      headline: text(form.headline),
      role_title: text(form.role_title),
      current_company: text(form.current_company),
      industry: text(form.industry),
      location: text(form.location),
      bio: text(form.bio),
      skills: list(form.skills),
      languages: list(form.languages),
      website_url: text(form.website_url),
      portfolio_url: text(form.portfolio_url),
      github_url: text(form.github_url),
      linkedin_url: text(form.linkedin_url),
      twitter_url: text(form.twitter_url),
      contact_email: text(form.contact_email),
      avatar_url: text(form.avatar_url),
      banner_url: text(form.banner_url),
      open_to: openTo,
      experience: clean(experience),
      education: clean(education),
      certifications: clean(certifications),
      achievements: clean(achievements),
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
    <form onSubmit={save} className="space-y-5">
      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 font-display text-sm font-semibold text-foreground">Basics</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Name" value={form.display_name} onChange={set("display_name")} />
          <Text label="Pronouns" value={form.pronouns} onChange={set("pronouns")} placeholder="she/her" />
          <Text
            label="Headline"
            value={form.headline}
            onChange={set("headline")}
            placeholder="AI student building agents"
          />
          <Text label="Industry" value={form.industry} onChange={set("industry")} placeholder="Artificial Intelligence" />
          <Text label="Current role" value={form.role_title} onChange={set("role_title")} placeholder="ML Intern" />
          <Text label="Company / school" value={form.current_company} onChange={set("current_company")} />
          <Text label="Location" value={form.location} onChange={set("location")} placeholder="Pune, India" />
          <Text label="Languages (comma separated)" value={form.languages} onChange={set("languages")} />
          <Text label="Avatar image URL" value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://" />
          <Text label="Cover image URL" value={form.banner_url} onChange={set("banner_url")} placeholder="https://" />
        </div>
        <label className="mt-3 block">
          <span className="eyebrow text-muted-foreground">About</span>
          <textarea
            value={form.bio}
            onChange={(e) => set("bio")(e.target.value)}
            rows={4}
            placeholder="What you're exploring, what you've built, what you want next."
            className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
          />
        </label>
        <Text
          label="Skills (comma separated)"
          value={form.skills}
          onChange={set("skills")}
          placeholder="Python, PyTorch, SQL, Figma"
        />
      </fieldset>

      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 font-display text-sm font-semibold text-foreground">Open to</legend>
        <div className="flex flex-wrap gap-2">
          {OPEN_TO.map((item) => {
            const active = openTo.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setOpenTo((prev) => (active ? prev.filter((x) => x !== item) : [...prev, item]))
                }
                className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-border-strong"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-border bg-card p-5">
        <legend className="px-1 font-display text-sm font-semibold text-foreground">Contact & links</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Text label="Contact email" value={form.contact_email} onChange={set("contact_email")} />
          <Text label="Website" value={form.website_url} onChange={set("website_url")} placeholder="https://" />
          <Text label="Portfolio" value={form.portfolio_url} onChange={set("portfolio_url")} placeholder="https://" />
          <Text label="GitHub" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/…" />
          <Text
            label="LinkedIn"
            value={form.linkedin_url}
            onChange={set("linkedin_url")}
            placeholder="https://linkedin.com/in/…"
          />
          <Text label="X / Twitter" value={form.twitter_url} onChange={set("twitter_url")} placeholder="https://x.com/…" />
        </div>
      </fieldset>

      <EntryEditor
        title="Experience"
        titleLabel="Role"
        orgLabel="Company"
        entries={experience}
        onChange={setExperience}
      />
      <EntryEditor
        title="Education"
        titleLabel="Degree / programme"
        orgLabel="School"
        entries={education}
        onChange={setEducation}
      />
      <EntryEditor
        title="Certifications"
        titleLabel="Certification"
        orgLabel="Issuer"
        entries={certifications}
        onChange={setCertifications}
      />
      <EntryEditor
        title="Achievements"
        titleLabel="Achievement"
        orgLabel="Where"
        entries={achievements}
        onChange={setAchievements}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="focus-ring rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function EntryEditor({
  title,
  titleLabel,
  orgLabel,
  entries,
  onChange,
}: {
  title: string;
  titleLabel: string;
  orgLabel: string;
  entries: Entry[];
  onChange: (next: Entry[]) => void;
}) {
  const update = (i: number, key: keyof Entry, value: string) =>
    onChange(entries.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));

  return (
    <fieldset className="rounded-xl border border-border bg-card p-5">
      <legend className="px-1 font-display text-sm font-semibold text-foreground">{title}</legend>
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Text label={titleLabel} value={entry.title} onChange={(v) => update(i, "title", v)} />
              <Text label={orgLabel} value={entry.org} onChange={(v) => update(i, "org", v)} />
              <Text label="Start" value={entry.start} onChange={(v) => update(i, "start", v)} placeholder="Jan 2025" />
              <Text label="End" value={entry.end} onChange={(v) => update(i, "end", v)} placeholder="Present" />
              <Text label="Location" value={entry.location} onChange={(v) => update(i, "location", v)} />
              <Text label="Link" value={entry.url} onChange={(v) => update(i, "url", v)} placeholder="https://" />
            </div>
            <label className="mt-3 block">
              <span className="eyebrow text-muted-foreground">Description</span>
              <textarea
                value={entry.description}
                onChange={(e) => update(i, "description", e.target.value)}
                rows={3}
                className="focus-ring mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(entries.filter((_, idx) => idx !== i))}
              className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...entries, { ...EMPTY_ENTRY }])}
        className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add {title.toLowerCase().replace(/s$/, "")}
      </button>
    </fieldset>
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
    <label className="mt-3 block first:mt-0 sm:mt-0">
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
