import type { Mail, MailProvider } from "../providers/types.js";
import type { LlmFn } from "./classify.js";
/** Produce a style-matched draft. Never sends. */
export declare function draftReply(mail: Mail, style: string, llm: LlmFn): Promise<string>;
/** Send a reply the user has already reviewed and approved. */
export declare function sendReply(provider: MailProvider, mail: Mail, approvedBody: string): Promise<{
    id: string;
}>;
