import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, Lightbulb, Users } from "lucide-react";
import { PageHeader } from "@/components/site/bits";

export const Route = createFileRoute("/_site/problems")({
  head: () => ({
    meta: [
      { title: "Problems & Projects — coming soon | Explorers" },
      {
        name: "description",
        content:
          "Soon on Explorers: post a real problem worth solving, show a project you shipped, and find people to build it with.",
      },
      { property: "og:title", content: "Problems & Projects — coming soon" },
      {
        property: "og:description",
        content: "A place to bring problems and leave with projects. Launching soon on Explorers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProblemsComingSoon,
});

const TEASERS = [
  {
    icon: Lightbulb,
    title: "Post a problem",
    body: "Describe something worth solving — in your city, your campus, your workflow.",
  },
  {
    icon: Hammer,
    title: "Turn it into a project",
    body: "Pick an open problem and ship it as portfolio proof, not another tutorial clone.",
  },
  {
    icon: Users,
    title: "Find builders",
    body: "Match with explorers on the same roadmap and build together.",
  },
];

function ProblemsComingSoon() {
  return (
    <>
      <PageHeader
        eyebrow="Coming soon"
        title="Bring a problem. Leave with a project."
        description="Problems & Projects is being built. Soon you'll be able to submit real problems, publish what you built and team up with other explorers."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-6 sm:p-8">
          <span className="eyebrow rounded-full bg-secondary/15 px-2.5 py-1 text-secondary">
            In the workshop
          </span>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {TEASERS.map((item) => (
              <li key={item.title} className="rounded-xl border border-border bg-card p-4">
                <item.icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-3 font-display text-base font-semibold text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/roadmaps"
              className="focus-ring rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
            >
              Explore roadmaps meanwhile
            </Link>
            <Link
              to="/profile"
              className="focus-ring rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Set up your profile
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
