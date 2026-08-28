import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { buildPersonalPlan } from "@/lib/assistant.functions";
import { GOALS, INTERESTS, LEVELS, STATUSES, STYLES } from "@/lib/personalize";
import { cn } from "@/lib/utils";

type Answers = {
  goal: string;
  level: string;
  interests: string[];
  hours_per_week: number;
  learning_style: string;
  status: string;
  region: string;
};

const EMPTY: Answers = {
  goal: "",
  level: "",
  interests: [],
  hours_per_week: 5,
  learning_style: "",
  status: "",
  region: "",
};

export function OnboardingDialog({
  userId,
  onDone,
  onSkip,
}: {
  userId: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const qc = useQueryClient();
  const savePlan = useServerFn(buildPersonalPlan);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [busy, setBusy] = useState(false);

  const steps = [
    {
      title: "What are you aiming for?",
      hint: "This shapes your roadmaps, articles and opportunities.",
      body: <Choices options={GOALS} value={a.goal} onChange={(goal) => setA({ ...a, goal })} />,
      valid: Boolean(a.goal),
    },
    {
      title: "Where are you right now? (choose 2)",
      hint: "Pick your level and your current situation — we tune the depth of everything to this.",
      body: (
        <div className="space-y-4">
          <Choices options={LEVELS} value={a.level} onChange={(level) => setA({ ...a, level })} />
          <Choices options={STATUSES} value={a.status} onChange={(status) => setA({ ...a, status })} />
          <p className="text-xs font-medium text-muted-foreground">
            Pick 2 answers here — one level and one that describes you.
          </p>
        </div>
      ),
      valid: Boolean(a.level && a.status),
    },
    {
      title: "Pick at least 2 topics you want to explore",
      hint: "Choose 2 or more to continue — your feed and updates follow these.",
      body: (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((option) => {
            const on = a.interests.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setA({
                    ...a,
                    interests: on ? a.interests.filter((i) => i !== option) : [...a.interests, option],
                  })
                }
                className={cn(
                  "focus-ring rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface/60 text-foreground hover:bg-accent",
                )}
              >
                {option}
              </button>
            );
          })}
          <p className="mt-1 w-full text-xs font-medium text-muted-foreground">
            {a.interests.length < 2
              ? `Choose at least 2 to continue (${a.interests.length}/2 selected)`
              : `${a.interests.length} selected`}
          </p>
        </div>
      ),
      valid: a.interests.length >= 2,
    },
    {
      title: "How do you like to learn, and how much time do you have?",
      hint: "We size your weekly plan around this.",
      body: (
        <div className="space-y-5">
          <Choices
            options={STYLES}
            value={a.learning_style}
            onChange={(learning_style) => setA({ ...a, learning_style })}
          />
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              Hours per week: <span className="text-primary">{a.hours_per_week}</span>
            </span>
            <input
              type="range"
              min={1}
              max={30}
              value={a.hours_per_week}
              onChange={(e) => setA({ ...a, hours_per_week: Number(e.target.value) })}
              className="mt-2 w-full accent-[hsl(var(--primary))]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Country or region (optional)</span>
            <input
              value={a.region}
              onChange={(e) => setA({ ...a, region: e.target.value })}
              placeholder="e.g. India"
              className="focus-ring mt-1.5 w-full rounded-xl border border-border bg-surface/60 px-3 py-2 text-sm"
            />
          </label>
        </div>
      ),
      valid: Boolean(a.learning_style),
    },
  ];

  const current = steps[step]!;

  async function finish() {
    setBusy(true);
    try {
      await savePlan({ data: { ...a, region: a.region.trim() || "not specified" } });
      await qc.invalidateQueries({ queryKey: ["user-preferences", userId] });
      toast.success("Your plan is ready");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your answers");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative w-full max-w-xl overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip for now"
          className="focus-ring absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-border bg-surface/50 px-6 py-5">
          <p className="eyebrow inline-flex items-center gap-1.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Explorers Guide
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
            {current.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-5">{current.body}</div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-6 rounded-full", i <= step ? "bg-primary" : "bg-border")}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="focus-ring rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={!current.valid || busy}
              onClick={() => (step === steps.length - 1 ? void finish() : setStep(step + 1))}
              className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep disabled:opacity-50"
            >
              {busy ? "Building your plan…" : step === steps.length - 1 ? "Build my plan" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Choices({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "focus-ring rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
            value === option
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface/50 text-foreground hover:bg-accent",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
