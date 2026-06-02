import type { Mail, MailProvider } from "../providers/types.js";
import type { LlmFn } from "./classify.js";
import { REPLY_SYSTEM_PROMPT } from "../prompts.js";
import { stripThink } from "../parse.js";

function extractMarked(text: string, open: string, close: string): string {
  const t = stripThink(text);
  const i = t.indexOf(open);
  const j = t.indexOf(close);
  if (i !== -1 && j !== -1 && j > i) return t.slice(i + open.length, j).trim();
  return t.trim();
}

/** Produce a style-matched draft. Never sends. */
export async function draftReply(mail: Mail, style: string, llm: LlmFn): Promise<string> {
  const prompt =
    `${REPLY_SYSTEM_PROMPT}\n\nWRITING STYLE:\n${style}\n\n` +
    `Email to reply to:\nFrom: ${mail.from}\nSubject: ${mail.subject}\n\n${mail.body}`;
  const raw = await llm(prompt);
  return extractMarked(raw, "<<<REPLY>>>", "<<<END>>>");
}

/** Send a reply the user has already reviewed and approved. */
export async function sendReply(provider: MailProvider, mail: Mail, approvedBody: string): Promise<{ id: string }> {
  return provider.sendReply(mail, approvedBody);
}
