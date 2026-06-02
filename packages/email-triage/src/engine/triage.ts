import type { MailProvider } from "../providers/types.js";
import type { Verdict } from "../taxonomy.js";
import type { TriageState } from "../state.js";
import type { LlmFn } from "./classify.js";
import { classifyEmail } from "./classify.js";

export type TriageItem = {
  uid: string;
  messageId: string;
  from: string;
  subject: string;
  verdict: Verdict;
  summary: string;
};

export type TriageResult = { items: TriageItem[]; urgent: TriageItem[] };

export type TriageArgs = {
  accountId: string;
  provider: MailProvider;
  state: TriageState;
  llm: LlmFn;
  urgencyRules: string;
  scanWindowDays: number;
  alertThreshold: number;
  selfHeader: string;
  summarize: (body: string) => Promise<string>;
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Drop self-generated mail to avoid an alert feedback loop. */
function isSelfMail(headers: string, subject: string, selfHeader: string): boolean {
  const headerRe = new RegExp(`^${escapeRe(selfHeader)}:`, "im");
  return headerRe.test(headers) || /^\s*(\[task\]|reminder:)/i.test(subject);
}

export async function triageInbox(a: TriageArgs): Promise<TriageResult> {
  const refs = await a.provider.listUnread(a.scanWindowDays);
  const items: TriageItem[] = [];

  for (const ref of refs) {
    if (isSelfMail(ref.headers, ref.subject, a.selfHeader)) continue;
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

  const urgent: TriageItem[] = [];
  for (const it of items) {
    if (it.verdict.score >= a.alertThreshold && !(await a.state.isNotified(a.accountId, it.uid))) {
      urgent.push(it);
      await a.state.markNotified(a.accountId, it.uid);
    }
  }
  await a.state.pruneNotified(a.accountId, refs.map((r) => r.uid));
  return { items, urgent };
}
