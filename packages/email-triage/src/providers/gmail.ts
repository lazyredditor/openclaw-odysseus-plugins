import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";
import type { Mail, MailProvider, MailRef } from "./types.js";
import type { GmailAccount } from "../config.js";

// The gmail_v1 client is loosely typed here; tests inject a fake with the same shape.
type GmailClient = any;
type Deps = { gmail?: GmailClient };

function header(headers: Array<{ name?: string | null; value?: string | null }>, name: string): string {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function decodeB64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function extractBody(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) return decodeB64Url(payload.body.data);
  for (const part of payload.parts ?? []) {
    const t = extractBody(part);
    if (t) return t;
  }
  if (payload.body?.data) return decodeB64Url(payload.body.data);
  return "";
}

export class GmailProvider implements MailProvider {
  constructor(private acc: GmailAccount, private deps: Deps = {}) {}

  private client(): GmailClient {
    if (this.deps.gmail) return this.deps.gmail;
    const auth = new OAuth2Client(this.acc.clientId, this.acc.clientSecret);
    auth.setCredentials({ refresh_token: this.acc.refreshToken });
    return gmail({ version: "v1", auth });
  }

  async listUnread(sinceDays: number): Promise<MailRef[]> {
    const c = this.client();
    const list = await c.users.messages.list({ userId: "me", q: `is:unread newer_than:${sinceDays}d` });
    const refs: MailRef[] = [];
    for (const m of list.data.messages ?? []) {
      const full = await c.users.messages.get({
        userId: "me",
        id: m.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Message-ID", "List-Unsubscribe"],
      });
      const hs = full.data.payload?.headers ?? [];
      refs.push({
        uid: String(m.id),
        messageId: header(hs, "Message-ID") || `<${m.id}>`,
        from: header(hs, "From"),
        subject: header(hs, "Subject"),
        headers: hs.map((h: any) => `${h.name}: ${h.value}`).join("\n"),
      });
    }
    return refs;
  }

  async fetchMessage(ref: MailRef): Promise<Mail> {
    const c = this.client();
    const full = await c.users.messages.get({ userId: "me", id: ref.uid, format: "full" });
    const body = extractBody(full.data.payload).slice(0, 800);
    return { ...ref, body };
  }

  async sendReply(original: Mail, body: string): Promise<{ id: string }> {
    const c = this.client();
    const subject = original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`;
    const raw = [
      `From: ${this.acc.user}`,
      `To: ${original.from}`,
      `Subject: ${subject}`,
      original.messageId ? `In-Reply-To: ${original.messageId}` : "",
      original.messageId ? `References: ${original.messageId}` : "",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ]
      .filter(Boolean)
      .join("\r\n");
    const encoded = Buffer.from(raw, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const res = await c.users.messages.send({ userId: "me", requestBody: { raw: encoded } });
    return { id: String(res.data.id) };
  }
}
