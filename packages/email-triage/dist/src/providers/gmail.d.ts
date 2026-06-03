import type { Mail, MailProvider, MailRef } from "./types.js";
import type { GmailAccount } from "../config.js";
type GmailClient = any;
type Deps = {
    gmail?: GmailClient;
};
export declare class GmailProvider implements MailProvider {
    private acc;
    private deps;
    constructor(acc: GmailAccount, deps?: Deps);
    private client;
    listUnread(sinceDays: number): Promise<MailRef[]>;
    fetchMessage(ref: MailRef): Promise<Mail>;
    sendReply(original: Mail, body: string): Promise<{
        id: string;
    }>;
}
export {};
