import type { Verdict } from "./taxonomy.js";
export type EmailParts = {
    from: string;
    subject: string;
    body: string;
    headers?: string;
};
/** Deterministic post-LLM overrides. These intentionally beat the model. */
export declare function applyOverrides(v: Verdict, e: EmailParts): Verdict;
