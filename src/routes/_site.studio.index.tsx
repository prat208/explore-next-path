import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { COLLECTIONS, COLLECTION_ORDER } from "@/lib/studio";
import { Pill } from "@/components/site/bits";
import { inputClass } from "@/components/studio/fields";

export const Route = createFileRoute("/_site/studio/")({
  component: StudioOverview,
});

const COUNTED = COLLECTION_ORDER.map((key) => COLLECTIONS[key]!).filter((c) => c.hasStatus);

function StudioOverview() {
  const { profile, isAdmin } = useAuth();

  const counts = useQuery({
    queryKey: ["studio-counts"],
    queryFn: async () =>
      Promise.all(
        COUNTED.map(async (item) => {
          const [all, published] = await Promise.all([
            supabase.from(item.table as never).select("id", { count: "exact", head: true }),
            supabase
              .from(item.table as never)
              .select("id", { count: "exact", head: true })
              .eq("status", "published"),
          ]);
          return { key: item.key, label: item.label, total: all.count ?? 0, published: published.count ?? 0 };
        }),
      ),
  });

  const searches = useQuery({
    queryKey: ["studio-searches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("search_queries")
        .select("query, results_count, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      return (data ?? []) as { query: string; results_count: number | null; created_at: string }[];
    },
  });

  return (
    <>
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Content operations{profile?.display_name ? `, ${profile.display_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live state of the knowledge graph: what is published, what is in draft, and what readers are searching for.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(counts.data ?? []).map((item) => (
          <Link
            key={item.key}
            to="/studio/$collection"
            params={{ collection: item.key }}
            className="hover-lift focus-ring rounded-xl border border-border bg-card p-5"
          >
            <p className="eyebrow text-secondary">{item.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{item.published}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.total - item.published} in draft · {item.total} total
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold text-foreground">Recent searches</h2>
        <p className="mt-1 text-sm text-muted-foreground">Queries with zero results are content gaps worth filling.</p>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {(searches.data ?? []).map((row, i) => (
            <li key={`${row.query}-${i}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="font-mono text-sm text-foreground">{row.query}</span>
              <span className="flex items-center gap-3">
                {row.results_count === 0 ? <Pill tone="primary">Gap</Pill> : <Pill tone="success">{row.results_count} results</Pill>}
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </span>
            </li>
          ))}
          {searches.data?.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground">No searches recorded yet.</li>
          )}
        </ul>
      </section>

      {isAdmin && <TeamSection />}
    </>
  );
}

function TeamSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const team = useQuery({
    queryKey: ["studio-team"],
    queryFn: async () => {
      const [roles, profiles] = await Promise.all([
        supabase.from("user_roles").select("id, user_id, role"),
        supabase.from("profiles").select("id, display_name"),
      ]);
      const names = new Map((profiles.data ?? []).map((p) => [p.id, p.display_name]));
      return (roles.data ?? []).map((r) => ({ ...r, name: names.get(r.user_id) ?? r.user_id }));
    },
  });

  async function grant() {
    const target = (team.data ?? []).find((row) => row.name?.toLowerCase() === email.trim().toLowerCase());
    if (!target) {
      toast.error("Enter the exact display name of an existing member");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: target.user_id, role: role as "editor" | "admin" | "user" });
    if (error) toast.error(error.message);
    else {
      toast.success("Role granted");
      setEmail("");
      void team.refetch();
    }
  }

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-foreground">Team & roles</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Editors can create and publish content. Admins can also manage roles.
      </p>
      <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {(team.data ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-foreground">{row.name}</span>
            <span className="flex items-center gap-3">
              <Pill tone={row.role === "user" ? "muted" : "primary"}>{row.role}</Pill>
              {row.role !== "admin" && row.role !== "super_admin" && (
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.from("user_roles").delete().eq("id", row.id);
                    void team.refetch();
                  }}
                  className="focus-ring text-xs font-semibold text-destructive"
                >
                  Revoke
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Member display name"
          className={inputClass}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={() => void grant()}
          className="focus-ring rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
        >
          Grant role
        </button>
      </div>
    </section>
  );
}
