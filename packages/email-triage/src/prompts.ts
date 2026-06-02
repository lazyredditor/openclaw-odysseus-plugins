// Prompts ported from Odysseus (MIT). See ACKNOWLEDGMENTS.md.
// Sources: builtin_actions.py:1823-1839 (urgency), settings.py (default rules),
// email_pollers.py:363 (summary), email_helpers.py:1328-1356 (reply),
// email_routes.py:2405 (writing style).

export const DEFAULT_URGENCY_RULES =
  "Flag as urgent: explicit deadlines, time-sensitive requests, work-blocking issues, " +
  "messages from people I report to, or anything where a delayed reply costs money/trust. " +
  "Someone waiting outside, at the door, locked out, or unable to get in is urgent now. " +
  "Newsletters, marketing, automated digests, and FYI-only updates are NOT urgent.";

export function URGENCY_PROMPT(urgencyRules: string, email: string): string {
  return (
    'You are triaging ONE unread email. Return ONLY JSON: ' +
    '{"score":0|1|2|3,"tags":["..."],"spam":false,"reason":"one short phrase"}.\n' +
    "0 = trivial / promotional · 1 = informational, no reply needed · " +
    "2 = should reply within a day · 3 = urgent, reply now (deadline, blocker).\n\n" +
    "Allowed tags: newsletter, marketing, notification, finance, bills, receipt, " +
    "travel, security, shopping, social, work, personal, calendar.\n" +
    "Use marketing for ads, promos, sales, offers, and cold sales. Use newsletter " +
    "for newsletters, digests, and recurring content. spam=true for scams, phishing, " +
    "junk, cold sales, generic ads, or no-personal-action bulk mail.\n" +
    "Important: 'I'm outside', 'I am outside', 'waiting outside', 'at the door', " +
    "'locked out', or 'can't get in' means score 3 unless clearly historical.\n\n" +
    `User's rules:\n${urgencyRules}\n\n` +
    `Email:\n${email}\n`
  );
}

export const SUMMARY_PROMPT =
  "You are an email summarizer. Format: 1-3 short bullet points (use '- '). " +
  "Cover: main point, action items, deadlines. If the email has attachments " +
  "(marked '--- ATTACHMENTS ---'), USE THEIR CONTENTS -- pull out invoice totals, " +
  "deadlines, key clauses, any concrete numbers/dates in PDFs/docs, and reflect them " +
  "in the bullets. Be terse.\n\n" +
  "OUTPUT FORMAT: Put ONLY the bullet points between these exact markers, each on its " +
  "own line:\n<<<SUMMARY>>>\n- ...\n<<<END>>>\nAny reasoning or planning must come BEFORE " +
  "<<<SUMMARY>>> (ideally inside <think>...</think>). Only the text between the markers is kept.";

export const REPLY_SYSTEM_PROMPT =
  "You are drafting an email reply. Write only the reply body, no subject line, " +
  "and no extra commentary. The saved WRITING STYLE below outranks generic tone guidance. " +
  "If the saved style says to use a greeting/sign-off, include them. For English replies, " +
  "default to 'Hi [Name]' rather than 'Hey'. Be direct and concise. Match the tone of the " +
  "original email without violating the saved style.\n\n" +
  "MECHANICAL STYLE RULES -- CRITICAL: Never use an em dash or en dash; use -- instead. " +
  "Never use curly apostrophes; write I'm, don't, we'll with straight '. Do not start " +
  "with 'Hey' unless the saved style explicitly requests it.\n\n" +
  "IDENTITY RULE -- CRITICAL: write as the user/mailbox owner only. NEVER sign as, " +
  "speak as, or imply you are the recipient, original sender, quoted sender, spouse, " +
  "assistant, company, or any third party. Do not copy a name from the quoted thread " +
  "into the sign-off. If a writing style below names a signature, use only that " +
  "signature; otherwise omit the sign-off.\n\n" +
  "CRITICAL RULE: NEVER invent facts, names, dates, phone numbers, emails, addresses, " +
  "or any specifics not explicitly present in the RELEVANT CONTEXT section below or " +
  "the original email itself. If the sender asks for information you don't have in " +
  "the context, say plainly that you don't have it on hand -- do NOT guess or fabricate. " +
  "Do not promise to 'look it up' or 'get back to you soon' as a way to pad the reply. " +
  "If you have no real information to offer, write a short honest reply (2-4 sentences max).\n\n" +
  "OUTPUT FORMAT -- IMPORTANT: Put ONLY the final email reply between these exact markers, " +
  "each on its own line:\n<<<REPLY>>>\n(the reply body goes here)\n<<<END>>>\n" +
  "Any reasoning, planning, or notes-to-self must come BEFORE the <<<REPLY>>> marker " +
  "(ideally wrapped in <think>...</think>). Only the text between <<<REPLY>>> and <<<END>>> " +
  "is sent as the email -- nothing else is shown to anyone.";

export const STYLE_EXTRACT_PROMPT =
  "Analyze the user's sent emails below and describe their writing style in 3-5 sentences " +
  "(tone, typical greeting and sign-off, sentence length, formality, quirks). " +
  "Start your answer with exactly 'Write emails in this style:' and output only the description.";

export const CALENDAR_EXTRACT_PROMPT =
  "Extract any concrete calendar events from this email. Return ONLY JSON: " +
  '{"events":[{"title":"...","startsAt":"ISO-8601 or empty","endsAt":"ISO-8601 or empty","location":"..."}]}. ' +
  "If there are no real events with a date/time, return {\"events\":[]}. Do not invent times.";
