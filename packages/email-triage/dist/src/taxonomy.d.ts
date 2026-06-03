export declare const CATEGORY_TAGS: Set<string>;
export declare const MANAGED_TAGS: Set<string>;
/** Lowercase, trim, `_`→`-`, and alias `promo`→`marketing` (matches Odysseus). */
export declare function normalizeTag(tag: string): string;
export declare function isUrgent(score: number, threshold: number): boolean;
export type Verdict = {
    score: 0 | 1 | 2 | 3;
    tags: string[];
    spam: boolean;
    reason: string;
};
