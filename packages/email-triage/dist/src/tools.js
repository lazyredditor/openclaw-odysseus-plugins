import { join } from "node:path";
import { Type } from "typebox";
import { textResult, jsonResult } from "openclaw/plugin-sdk/agent-runtime";
import { makeProvider } from "./providers/factory.js";
import { makeTriageState } from "./state.js";
import { fileKeyedStore } from "./store.js";
import { triageInbox } from "./engine/triage.js";
import { draftReply, sendReply } from "./engine/reply.js";
import { extractStyle } from "./engine/style.js";
import { SUMMARY_PROMPT, DEFAULT_URGENCY_RULES } from "./prompts.js";
import { extractMarked } from "./parse.js";
// `api` is OpenClaw's plugin API (loosely typed here to avoid importing the full
// SDK surface). All calls below match the verified openclaw@2026.5.x contract.
export function registerTools(api, cfg) {
    // File-backed state under the host state dir (openKeyedStore is trusted-only).
    const baseDir = api.runtime.state.resolveStateDir();
    const store = fileKeyedStore(join(baseDir, "email-triage", "state.json"));
    const state = makeTriageState(store);
    // Host LLM. NO model is passed unless the operator explicitly pinned one in
    // config — so the plugin uses whatever provider/fallbacks the host configured.
    const llm = async (prompt) => {
        const res = await api.runtime.llm.complete({
            messages: [{ role: "user", content: prompt }],
            ...(cfg.model ? { model: cfg.model } : {}),
            temperature: 0.1,
            maxTokens: 800,
            purpose: "email-triage",
        });
        return res.text;
    };
    const summarize = async (body) => extractMarked(await llm(`${SUMMARY_PROMPT}\n\n${body}`), "<<<SUMMARY>>>", "<<<END>>>");
    const account = (id) => {
        const a = cfg.accounts.find((x) => !id || x.id === id) ?? cfg.accounts[0];
        if (!a)
            throw new Error("email-triage: no account configured (set plugins.entries.email-triage.config.accounts)");
        return a;
    };
    api.registerTool({
        name: "triage_inbox",
        label: "Triage Inbox",
        description: "Scan unread email and return urgent items with summaries.",
        parameters: Type.Object({ accountId: Type.Optional(Type.String()) }),
        async execute(_id, p) {
            const acc = account(p.accountId);
            const res = await triageInbox({
                accountId: acc.id,
                provider: makeProvider(acc),
                state,
                llm,
                urgencyRules: cfg.urgencyRules ?? DEFAULT_URGENCY_RULES,
                scanWindowDays: cfg.scanWindowDays ?? 7,
                alertThreshold: cfg.alertThreshold ?? 2,
                selfHeader: cfg.selfHeader ?? "X-OpenClaw-Triage",
                summarize,
            });
            return jsonResult({ urgent: res.urgent, total: res.items.length });
        },
    });
    api.registerTool({
        name: "summarize_email",
        label: "Summarize Email",
        description: "Summarize one email body into 1-3 bullets.",
        parameters: Type.Object({ body: Type.String() }),
        async execute(_id, p) {
            return textResult(await summarize(p.body), undefined);
        },
    });
    api.registerTool({
        name: "draft_reply",
        label: "Draft Reply",
        description: "Draft a style-matched reply. Does NOT send — show it to the user for approval first.",
        parameters: Type.Object({
            accountId: Type.Optional(Type.String()),
            from: Type.String(),
            subject: Type.String(),
            body: Type.String(),
            messageId: Type.String(),
        }),
        async execute(_id, p) {
            const acc = account(p.accountId);
            const style = (await state.getStyle(acc.id)) ?? "Write a clear, concise reply.";
            const mail = { from: p.from, subject: p.subject, body: p.body, messageId: p.messageId, uid: "", headers: "" };
            return textResult(await draftReply(mail, style, llm), undefined);
        },
    });
    api.registerTool({
        name: "send_reply",
        label: "Send Reply",
        description: "Send a reply the user has reviewed and approved.",
        parameters: Type.Object({
            accountId: Type.Optional(Type.String()),
            to: Type.String(),
            subject: Type.String(),
            messageId: Type.String(),
            body: Type.String(),
        }),
        async execute(_id, p) {
            const acc = account(p.accountId);
            const mail = { from: p.to, subject: p.subject, messageId: p.messageId, uid: "", headers: "", body: "" };
            const res = await sendReply(makeProvider(acc), mail, p.body);
            return textResult(`sent: ${res.id}`, undefined);
        },
    });
    api.registerTool({
        name: "set_writing_style",
        label: "Set Writing Style",
        description: "Derive and store the user's writing style from sample sent emails (improves draft_reply).",
        parameters: Type.Object({
            accountId: Type.Optional(Type.String()),
            samples: Type.Array(Type.String()),
        }),
        async execute(_id, p) {
            const acc = account(p.accountId);
            const style = await extractStyle(p.samples, llm);
            await state.setStyle(acc.id, style);
            return textResult(style, undefined);
        },
    });
}
