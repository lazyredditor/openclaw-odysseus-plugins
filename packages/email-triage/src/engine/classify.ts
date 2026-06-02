import type { Mail } from "../providers/types.js";
import type { Verdict } from "../taxonomy.js";
import { parseVerdict } from "../parse.js";
import { applyOverrides } from "../overrides.js";
import { URGENCY_PROMPT } from "../prompts.js";

/** The host LLM, injected as a single-prompt function. No model is ever named
 *  here — the host resolves its own default/fallback chain. */
export type LlmFn = (prompt: string) => Promise<string>;

export async function classifyEmail(mail: Mail, urgencyRules: string, llm: LlmFn): Promise<Verdict> {
  const emailBlock = `From: ${mail.from}\nSubject: ${mail.subject}\nSnippet:\n${mail.body}`;
  const raw = await llm(URGENCY_PROMPT(urgencyRules, emailBlock));
  const verdict = parseVerdict(raw);
  return applyOverrides(verdict, {
    from: mail.from,
    subject: mail.subject,
    body: mail.body,
    headers: mail.headers,
  });
}
