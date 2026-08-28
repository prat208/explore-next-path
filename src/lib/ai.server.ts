/** Server-only helpers for Lovable AI Gateway (never import from client code). */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Runs a chat completion on Lovable AI and returns the assistant text. */
export async function chatComplete(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean } = {},
): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError(401, "AI is not configured for this project.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3.7-flash",
      messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text.slice(0, 400);
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? message;
    } catch {
      /* keep raw text */
    }
    if (res.status === 402) message = message || "AI credits are exhausted for this workspace.";
    throw new AiError(res.status, message);
  }

  const data = JSON.parse(text) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/** Parses a JSON object out of a model reply, tolerating code fences. */
export function parseJsonReply<T>(raw: string): T | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}
