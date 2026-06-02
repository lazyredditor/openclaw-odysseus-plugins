import { ImapFlow } from "imapflow";
import nodemailer, { type Transporter } from "nodemailer";
import type { Mail, MailProvider, MailRef } from "./types.js";
import type { ImapAccount } from "../config.js";

type Deps = { imap?: ImapFlow; transport?: Transporter };

export class ImapProvider implements MailProvider {
  constructor(private acc: ImapAccount, private deps: Deps = {}) {}

  private imap(): ImapFlow {
    return (
      this.deps.imap ??
      new ImapFlow({
        host: this.acc.host,
        port: this.acc.port ?? 993,
        secure: this.acc.secure ?? true,
        auth: { user: this.acc.user, pass: this.acc.pass },
        logger: false,
      })
    );
  }

  private transport(): Transporter {
    return (
      this.deps.transport ??
      nodemailer.createTransport({
        host: this.acc.smtpHost ?? this.acc.host,
        port: this.acc.smtpPort ?? 465,
        secure: (this.acc.smtpPort ?? 465) === 465,
        auth: { user: this.acc.user, pass: this.acc.pass },
      })
    );
  }

  async listUnread(sinceDays: number): Promise<MailRef[]> {
    const client = this.imap();
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const since = new Date(Date.now() - sinceDays * 86400_000);
      const uids = (await client.search({ seen: false, since }, { uid: true })) || [];
      const refs: MailRef[] = [];
      for (const uid of uids) {
        const msg: any = await client.fetchOne(String(uid), { envelope: true, headers: true }, { uid: true });
        if (!msg) continue;
        refs.push({
          uid: String(uid),
          messageId: msg.envelope?.messageId ?? `<uid-${uid}>`,
          from: msg.envelope?.from?.[0]?.address ?? "",
          subject: msg.envelope?.subject ?? "",
          headers: msg.headers?.toString?.() ?? "",
        });
      }
      return refs;
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async fetchMessage(ref: MailRef): Promise<Mail> {
    const client = this.imap();
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const msg: any = await client.fetchOne(ref.uid, { source: true, envelope: true }, { uid: true });
      const raw: string = msg?.source?.toString?.() ?? "";
      const body = raw.split(/\r?\n\r?\n/).slice(1).join("\n\n").slice(0, 800);
      return { ...ref, body };
    } finally {
      lock.release();
      await client.logout();
    }
  }

  async sendReply(original: Mail, body: string): Promise<{ id: string }> {
    const t = this.transport();
    const info = await t.sendMail({
      from: this.acc.from ?? this.acc.user,
      to: original.from,
      subject: original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`,
      inReplyTo: original.messageId,
      references: original.messageId,
      text: body,
    });
    return { id: (info as { messageId: string }).messageId };
  }
}
