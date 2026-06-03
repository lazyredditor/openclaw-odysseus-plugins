import { ImapFlow } from "imapflow";
import { type Transporter } from "nodemailer";
import type { Mail, MailProvider, MailRef } from "./types.js";
import type { ImapAccount } from "../config.js";
type Deps = {
    imap?: ImapFlow;
    transport?: Transporter;
};
export declare class ImapProvider implements MailProvider {
    private acc;
    private deps;
    constructor(acc: ImapAccount, deps?: Deps);
    private imap;
    private transport;
    listUnread(sinceDays: number): Promise<MailRef[]>;
    fetchMessage(ref: MailRef): Promise<Mail>;
    sendReply(original: Mail, body: string): Promise<{
        id: string;
    }>;
}
export {};
