import type { Verdict } from "./taxonomy.js";
export declare function stripThink(text: string): string;
/** Return the text between `open` and `close` markers (after stripping reasoning).
 *  Falls back to the whole stripped text when markers are absent. */
export declare function extractMarked(text: string, open: string, close: string): string;
/** Tolerant verdict parser: strips reasoning, extracts the first JSON object,
 *  repairs truncation, and clamps to safe defaults. Never throws. */
export declare function parseVerdict(raw: string): Verdict;
