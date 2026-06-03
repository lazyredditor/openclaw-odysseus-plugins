export const CATEGORY_TAGS = new Set([
    "newsletter", "marketing", "notification", "finance", "bills", "receipt",
    "travel", "security", "shopping", "social", "work", "personal", "calendar",
]);
export const MANAGED_TAGS = new Set([...CATEGORY_TAGS, "urgent", "reply-soon"]);
/** Lowercase, trim, `_`→`-`, and alias `promo`→`marketing` (matches Odysseus). */
export function normalizeTag(tag) {
    const t = tag.trim().toLowerCase().replace(/_/g, "-");
    return t === "promo" ? "marketing" : t;
}
export function isUrgent(score, threshold) {
    return score >= threshold;
}
