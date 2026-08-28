/**
 * Lovable AI Gateway helpers for Explorer Studio authoring assistance.
 * Server-only: never import from client components.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

export async function chatJson<T>(system: string, user: string): Promise<T> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project yet.");

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: `${system}\nReply with valid minified JSON only. No markdown fences.` },
        { role: "user", content: user },
      ],
    }),
  });

  if (response.status === 429) throw new Error("AI rate limit reached — try again in a moment.");
  if (response.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace.");
  if (!response.ok) throw new Error(`AI request failed (${response.status})`);

  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  return parseJson<T>(raw);
}

export function parseJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice) as T;
  } catch {
    throw new Error("The AI returned something unreadable. Try rephrasing your prompt.");
  }
}

export function slug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const ROADMAP_SYSTEM = `You design clickable tree-diagram learning roadmaps for a platform called Explorers (AI & technology, for students and builders).
Return JSON shaped exactly:
{"title":string,"description":string,"nodes":[{"title":string,"description":string,"group_label":string,"difficulty":"beginner"|"intermediate"|"advanced","estimated_hours":number,"skills":string[],"depth":number,"branch":number,"video_query":string}],"edges":[{"source":string,"target":string,"label":string}]}
Rules:
- 10 to 18 nodes, arranged as a branching TREE: one entry node at depth 0, then 2-4 parallel tracks that branch and later reconverge on advanced nodes.
- "depth" is the row (0 = start). "branch" is the horizontal lane index within that depth, starting at 0.
- edges reference node titles exactly; every non-entry node has at least one incoming edge; label is short like "then", "or", "requires".
- skills: 2-4 concrete skills per node. video_query: a precise YouTube search phrase for that step.
- Language: plain, practical, no hype.`;

export const BLOCKS_SYSTEM = `You write interactive editorial content blocks for Explorers (AI & technology publication for students and builders).
Return JSON: {"blocks":[{"type":string,"data":object}]}
Allowed types and their data shape:
paragraph {text}, heading {text, level:"2"|"3"}, list {items:string[], ordered:boolean}, quote {text, attribution},
callout {tone:"info"|"warning"|"success", title, text}, definition {term, text}, checklist {title, items:string[]},
quiz {question, options:string[], correctIndex:number, explanation}, steps {items:[{title,text}]},
timeline {events:[{date,title,text}]}, comparison {attributes:string[], items:[{name,values:string[]}]},
stats {items:[{value,label}]}, faq {items:[{question,answer}]}, code {language, code}, terminal {code},
keytakeaways {items:string[]}.
Rules: 8-14 blocks, start with a paragraph, mix in at least one quiz, one comparison or timeline, one checklist or steps, and end with keytakeaways. Be specific and factual; no filler.`;
