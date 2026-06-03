import { CATEGORY_TAGS, normalizeTag } from "./taxonomy.js";
export function stripThink(text) {
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
/** Return the text between `open` and `close` markers (after stripping reasoning).
 *  Falls back to the whole stripped text when markers are absent. */
export function extractMarked(text, open, close) {
    const t = stripThink(text);
    const i = t.indexOf(open);
    const j = t.indexOf(close);
    if (i !== -1 && j !== -1 && j > i)
        return t.slice(i + open.length, j).trim();
    return t.trim();
}
function firstJsonObject(text) {
    const start = text.indexOf("{");
    if (start === -1)
        return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === "{")
            depth++;
        else if (text[i] === "}") {
            depth--;
            if (depth === 0)
                return text.slice(start, i + 1);
        }
    }
    return text.slice(start); // truncated — caller repairs
}
function clampScore(n) {
    const v = Math.round(Number(n));
    if (v <= 0 || Number.isNaN(v))
        return 0;
    return (v >= 3 ? 3 : v);
}
function cleanTags(raw) {
    const arr = typeof raw === "string" ? [raw] : Array.isArray(raw) ? raw : [];
    const out = [];
    for (const t of arr) {
        if (typeof t !== "string")
            continue;
        const tag = normalizeTag(t);
        if (CATEGORY_TAGS.has(tag) && !out.includes(tag))
            out.push(tag);
    }
    return out.slice(0, 4);
}
/** Tolerant verdict parser: strips reasoning, extracts the first JSON object,
 *  repairs truncation, and clamps to safe defaults. Never throws. */
export function parseVerdict(raw) {
    const safe = { score: 0, tags: [], spam: false, reason: "" };
    let text = stripThink(raw).trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
    }
    const candidate = firstJsonObject(text);
    if (!candidate)
        return safe;
    let obj;
    try {
        obj = JSON.parse(candidate);
    }
    catch {
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
