import type { MailProvider } from "../providers/types.js";
import type { Verdict } from "../taxonomy.js";
import type { TriageState } from "../state.js";
import type { LlmFn } from "./classify.js";
export type TriageItem = {
    uid: string;
    messageId: string;
    from: string;
    subject: string;
    verdict: Verdict;
    summary: string;
};
export type TriageResult = {
    items: TriageItem[];
    urgent: TriageItem[];
};
export type TriageArgs = {
    accountId: string;
    provider: MailProvider;
    state: TriageState;
    llm: LlmFn;
    urgencyRules: string;
    scanWindowDays: number;
    alertThreshold: number;
    selfHeader: string;
    summarize: (body: string) => Promise<string>;
};
export declare function triageInbox(a: TriageArgs): Promise<TriageResult>;
