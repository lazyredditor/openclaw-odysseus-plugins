import type { Verdict } from "./taxonomy.js";
import { CATEGORY_TAGS, normalizeTag } from "./taxonomy.js";

export function stripThink(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function firstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start); // truncated — caller repairs
}

function clampScore(n: unknown): 0 | 1 | 2 | 3 {
  const v = Math.round(Number(n));
  if (v <= 0 || Number.isNaN(v)) return 0;
  return (v >= 3 ? 3 : v) as 0 | 1 | 2 | 3;
}

function cleanTags(raw: unknown): string[] {
  const arr = typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw : [];
  const out: string[] = [];
  for (const t of arr) {
    if (typeof t !== "string") continue;
    const tag = normalizeTag(t);
    if (CATEGORY_TAGS.has(tag) && !out.includes(tag)) out.push(tag);
  }
  return out.slice(0, 4);
}

/** Tolerant verdict parser: strips reasoning, extracts the first JSON object,
 *  repairs truncation, and clamps to safe defaults. Never throws. */
export function parseVerdict(raw: string): Verdict {
  const safe: Verdict = { score: 0, tags: [], spam: false, reason: "" };
  let text = stripThink(raw).trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  }
  const candidate = firstJsonObject(text);
  if (!candidate) return safe;
  let obj: any;
  try {
    obj = JSON.parse(candidate);
  } catch {
    const m = candidate.match(/"score"\s*:\s*([0-3])/);
    return m ? { ...safe, score: clampScore(m[1]) } : safe;
  }
  return {
    score: clampScore(obj.score),
    tags: cleanTags(obj.tags),
    spam: Boolean(obj.spam),
    reason: typeof obj.reason === "string" ? obj.reason.slice(0, 200) : "",
  };
}
