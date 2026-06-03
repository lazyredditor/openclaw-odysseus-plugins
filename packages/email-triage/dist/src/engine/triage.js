import { classifyEmail } from "./classify.js";
function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Drop self-generated mail to avoid an alert feedback loop. */
function isSelfMail(headers, subject, selfHeader) {
    const headerRe = new RegExp(`^${escapeRe(selfHeader)}:`, "im");
    return headerRe.test(headers) || /^\s*(\[task\]|reminder:)/i.test(subject);
}
export async function triageInbox(a) {
    const refs = await a.provider.listUnread(a.scanWindowDays);
    const items = [];
    for (const ref of refs) {
        if (isSelfMail(ref.headers, ref.subject, a.selfHeader))
            continue;
        const mail = await a.provider.fetchMessage(ref);
        let verdict = await a.state.getVerdict(a.accountId, mail.messageId);
        let summary = "";
        if (!verdict) {
            verdict = await classifyEmail(mail, a.urgencyRules, a.llm);
            summary = await a.summarize(mail.body);
            await a.state.setVerdict(a.accountId, mail.messageId, verdict);
        }
        items.push({ uid: ref.uid, messageId: mail.messageId, from: mail.from, subject: mail.subject, verdict, summary });
    }
    const urgent = [];
    for (const it of items) {
        if (it.verdict.score >= a.alertThreshold && !(await a.state.isNotified(a.accountId, it.uid))) {
            urgent.push(it);
            await a.state.markNotified(a.accountId, it.uid);
        }
    }
    await a.state.pruneNotified(a.accountId, refs.map((r) => r.uid));
    return { items, urgent };
}
