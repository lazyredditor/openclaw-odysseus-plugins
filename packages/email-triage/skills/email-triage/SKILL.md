---
name: email-triage
description: Triage the user's unread email — surface urgent messages, summarize them, and draft replies. Use when the user asks to check email, asks whether anything is urgent, or asks to reply to an email.
metadata:
  openclaw:
    requires:
      config: email-triage
---

# Email Triage

When the user asks to check email or whether anything is urgent:
1. Call `triage_inbox`. It returns `{ urgent: [...], total }` where each urgent item has sender, subject, verdict (score/tags), and a summary.
2. Report each urgent item concisely: sender, subject, one-line summary, and why it's urgent.
3. If `urgent` is empty, say there's nothing urgent.

To reply to an email:
1. Call `draft_reply` with the email's `from`, `subject`, `body`, and `messageId`. It returns a draft — do NOT send it.
2. Show the draft to the user and ask for approval or edits.
3. Only after explicit approval, call `send_reply` with the approved `body` (and `to`, `subject`, `messageId`).

Never call `send_reply` without first showing the draft and getting the user's approval.

To improve drafts, you can call `set_writing_style` with a few of the user's past sent emails; it stores their style for future drafts.
