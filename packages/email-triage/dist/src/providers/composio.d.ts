import type { Mail, MailProvider, MailRef } from "./types.js";
import type { ComposioAccount } from "../config.js";
/** Executes a Composio action and returns its result payload. Injected in tests;
 *  the default hits Composio's HTTP API in production. */
export type ComposioExecutor = (action: string, params: Record<string, unknown>) => Promise<any>;
export declare class ComposioProvider implements MailProvider {
    private acc;
    private exec;
    constructor(acc: ComposioAccount, exec?: ComposioExecutor);
    listUnread(sinceDays: number): Promise<MailRef[]>;
    fetchMessage(ref: MailRef): Promise<Mail>;
    sendReply(original: Mail, body: string): Promise<{
        id: string;
    }>;
}
