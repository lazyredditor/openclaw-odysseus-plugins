export const CATEGORY_TAGS = new Set<string>([
  "newsletter", "marketing", "notification", "finance", "bills", "receipt",
  "travel", "security", "shopping", "social", "work", "personal", "calendar",
]);

export const MANAGED_TAGS = new Set<string>([...CATEGORY_TAGS, "urgent", "reply-soon"]);

/** Lowercase, trim, `_`→`-`, and alias `promo`→`marketing` (matches Odysseus). */
export function normalizeTag(tag: string): string {
  const t = tag.trim().toLowerCase().replace(/_/g, "-");
  return t === "promo" ? "marketing" : t;
}

export function isUrgent(score: number, threshold: number): boolean {
  return score >= threshold;
}

export type Verdict = {
  score: 0 | 1 | 2 | 3;
  tags: string[];
  spam: boolean;
  reason: string;
};
