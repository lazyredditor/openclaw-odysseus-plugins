import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
export class ImapProvider {
    acc;
    deps;
    constructor(acc, deps = {}) {
        this.acc = acc;
        this.deps = deps;
    }
    imap() {
        return (this.deps.imap ??
            new ImapFlow({
                host: this.acc.host,
                port: this.acc.port ?? 993,
                secure: this.acc.secure ?? true,
                auth: { user: this.acc.user, pass: this.acc.pass },
                logger: false,
            }));
    }
    transport() {
        return (this.deps.transport ??
            nodemailer.createTransport({
                host: this.acc.smtpHost ?? this.acc.host,
                port: this.acc.smtpPort ?? 465,
                secure: (this.acc.smtpPort ?? 465) === 465,
                auth: { user: this.acc.user, pass: this.acc.pass },
            }));
    }
    async listUnread(sinceDays) {
        const client = this.imap();
        await client.connect();
        const lock = await client.getMailboxLock("INBOX");
        try {
            const since = new Date(Date.now() - sinceDays * 86400_000);
            const uids = (await client.search({ seen: false, since }, { uid: true })) || [];
            const refs = [];
            for (const uid of uids) {
                const msg = await client.fetchOne(String(uid), { envelope: true, headers: true }, { uid: true });
                if (!msg)
                    continue;
                refs.push({
                    uid: String(uid),
                    messageId: msg.envelope?.messageId ?? `<uid-${uid}>`,
                    from: msg.envelope?.from?.[0]?.address ?? "",
                    subject: msg.envelope?.subject ?? "",
                    headers: msg.headers?.toString?.() ?? "",
                });
            }
            return refs;
        }
        finally {
            lock.release();
            await client.logout();
        }
    }
    async fetchMessage(ref) {
        const client = this.imap();
        await client.connect();
        const lock = await client.getMailboxLock("INBOX");
        try {
            const msg = await client.fetchOne(ref.uid, { source: true, envelope: true }, { uid: true });
            const raw = msg?.source?.toString?.() ?? "";
            const body = raw.split(/\r?\n\r?\n/).slice(1).join("\n\n").slice(0, 800);
            return { ...ref, body };
        }
        finally {
            lock.release();
            await client.logout();
        }
    }
    async sendReply(original, body) {
        const t = this.transport();
        const info = await t.sendMail({
            from: this.acc.from ?? this.acc.user,
            to: original.from,
            subject: original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`,
            inReplyTo: original.messageId,
            references: original.messageId,
            text: body,
        });
        return { id: info.messageId };
    }
}
