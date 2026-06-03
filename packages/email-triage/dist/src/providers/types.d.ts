export type MailRef = {
    uid: string;
    messageId: string;
    from: string;
    subject: string;
    headers: string;
};
export type Mail = MailRef & {
    body: string;
};
export interface MailProvider {
    listUnread(sinceDays: number): Promise<MailRef[]>;
    fetchMessage(ref: MailRef): Promise<Mail>;
    sendReply(original: Mail, body: string): Promise<{
        id: string;
    }>;
    move?(ref: MailRef, folder: string): Promise<void>;
}
