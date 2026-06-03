const COMPOSIO_BASE = "https://backend.composio.dev";
// NOTE: Composio's exact action names and response shapes are version-specific and
// were NOT verifiable here (the account's Composio key is broken). The mapping below
// is the documented GMAIL_* action shape; verify against a live Composio connection
// before relying on the production path. The injected-executor seam keeps everything
// else (and the tests) provider-agnostic.
function defaultExecutor(acc) {
    return async (action, params) => {
        const base = acc.baseUrl ?? COMPOSIO_BASE;
        const res = await fetch(`${base}/api/v2/actions/${action}/execute`, {
            method: "POST",
            headers: { "content-type": "application/json", "x-api-key": acc.apiKey },
            body: JSON.stringify({ connectedAccountId: acc.connectedAccountId, input: params }),
        });
        if (!res.ok)
            throw new Error(`composio ${action} failed: ${res.status}`);
        const json = await res.json();
        return json.data ?? json.response_data ?? json;
    };
}
export class ComposioProvider {
    acc;
    exec;
    constructor(acc, exec) {
        this.acc = acc;
        this.exec = exec ?? defaultExecutor(acc);
    }
    async listUnread(sinceDays) {
        const out = await this.exec("GMAIL_FETCH_EMAILS", {
            query: `is:unread newer_than:${sinceDays}d`,
            max_results: 25,
        });
        const msgs = out?.messages ?? out?.emails ?? [];
        return msgs.map((m) => ({
            uid: String(m.message_id ?? m.id ?? ""),
            messageId: String(m.message_id ?? m.id ?? ""),
            from: String(m.sender ?? m.from ?? ""),
            subject: String(m.subject ?? ""),
            headers: m.headers ? Object.entries(m.headers).map(([k, v]) => `${k}: ${v}`).join("\n") : "",
        }));
    }
    async fetchMessage(ref) {
        const out = await this.exec("GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID", { message_id: ref.uid });
        const body = String(out?.body ?? out?.text ?? out?.snippet ?? "").slice(0, 800);
        return { ...ref, body };
    }
    async sendReply(original, body) {
        const out = await this.exec("GMAIL_SEND_EMAIL", {
            recipient_email: original.from,
            subject: original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`,
            body,
        });
        return { id: String(out?.id ?? out?.message_id ?? "sent") };
    }
}
