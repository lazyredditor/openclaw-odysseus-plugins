import { REPLY_SYSTEM_PROMPT } from "../prompts.js";
import { extractMarked } from "../parse.js";
/** Produce a style-matched draft. Never sends. */
export async function draftReply(mail, style, llm) {
    const prompt = `${REPLY_SYSTEM_PROMPT}\n\nWRITING STYLE:\n${style}\n\n` +
        `Email to reply to:\nFrom: ${mail.from}\nSubject: ${mail.subject}\n\n${mail.body}`;
    const raw = await llm(prompt);
    return extractMarked(raw, "<<<REPLY>>>", "<<<END>>>");
}
/** Send a reply the user has already reviewed and approved. */
export async function sendReply(provider, mail, approvedBody) {
    return provider.sendReply(mail, approvedBody);
}
