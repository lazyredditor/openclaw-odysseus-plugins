import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";
function header(headers, name) {
    return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}
function decodeB64Url(data) {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}
function extractBody(payload) {
    if (!payload)
        return "";
    if (payload.mimeType === "text/plain" && payload.body?.data)
        return decodeB64Url(payload.body.data);
    for (const part of payload.parts ?? []) {
        const t = extractBody(part);
        if (t)
            return t;
    }
    if (payload.body?.data)
        return decodeB64Url(payload.body.data);
    return "";
}
export class GmailProvider {
    acc;
    deps;
    constructor(acc, deps = {}) {
        this.acc = acc;
        this.deps = deps;
    }
    client() {
        if (this.deps.gmail)
            return this.deps.gmail;
        const auth = new OAuth2Client(this.acc.clientId, this.acc.clientSecret);
        auth.setCredentials({ refresh_token: this.acc.refreshToken });
        return gmail({ version: "v1", auth });
    }
    async listUnread(sinceDays) {
        const c = this.client();
        const list = await c.users.messages.list({ userId: "me", q: `is:unread newer_than:${sinceDays}d` });
        const refs = [];
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
                headers: hs.map((h) => `${h.name}: ${h.value}`).join("\n"),
            });
        }
        return refs;
    }
    async fetchMessage(ref) {
        const c = this.client();
        const full = await c.users.messages.get({ userId: "me", id: ref.uid, format: "full" });
        const body = extractBody(full.data.payload).slice(0, 800);
        return { ...ref, body };
    }
    async sendReply(original, body) {
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
