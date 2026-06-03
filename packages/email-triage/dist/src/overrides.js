// Ported verbatim from Odysseus builtin_actions.py:1886-1908. Matched against a
// lowercased blob of headers + subject + body.
const OUTSIDE_A = /\b(i'?m|i am|im|we'?re|we are)\s+outside\b/;
const OUTSIDE_B = /\b(waiting outside|at the door|locked out|can'?t get in|cannot get in)\b/;
const BULKISH = /\b(list-unsubscribe|list-id|mailchimp|mailchimpapp|view this email in your browser|unsubscribe|newsletter|digest|precedence:\s*bulk)\b/;
const MARKETINGISH = /\b(advertisement|sponsored|promo|promotion|sale|discount|offer|limited time|deal|tickets?|tour|merch|stream|purchase|sold out|low tickets|coupon|shop now|buy now)\b/;
/** Deterministic post-LLM overrides. These intentionally beat the model. */
export function applyOverrides(v, e) {
    const blob = `${e.headers ?? ""}\n${e.subject}\n${e.body}`.toLowerCase();
    let score = v.score;
    let reason = v.reason;
    const tags = [...v.tags];
    if (OUTSIDE_A.test(blob) || OUTSIDE_B.test(blob)) {
        if (score < 3)
            reason = "person is waiting outside";
        score = Math.max(score, 3);
    }
    const bulkish = BULKISH.test(blob);
    const marketingish = MARKETINGISH.test(blob);
    if (bulkish && !tags.includes("newsletter"))
        tags.push("newsletter");
    if (marketingish && !tags.includes("marketing"))
        tags.push("marketing");
    if ((bulkish || marketingish) && score < 2) {
        score = 0;
        if (!reason || reason.toLowerCase().includes("urgent")) {
            reason = "Bulk marketing/newsletter; no personal reply needed";
        }
    }
    return {
        score: Math.max(0, Math.min(3, score)),
        tags: tags.slice(0, 4),
        spam: v.spam,
        reason,
    };
}
