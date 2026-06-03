import { parseVerdict } from "../parse.js";
import { applyOverrides } from "../overrides.js";
import { URGENCY_PROMPT } from "../prompts.js";
export async function classifyEmail(mail, urgencyRules, llm) {
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
