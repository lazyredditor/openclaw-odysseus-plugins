# openclaw-odysseus-plugins

OpenClaw plugins inspired by Odysseus.

## email-triage

Scan a mailbox, classify each unread email (urgency 0–3, category tags, spam),
summarize it, and draft style-matched replies you approve before sending.
Works on any OpenClaw install — no model IDs, channels, or accounts hardcoded.

**Install (one command):**

```bash
openclaw plugins install email-triage --marketplace lazyredditor/openclaw-odysseus-plugins
```

See [`packages/email-triage`](packages/email-triage) for configuration.
