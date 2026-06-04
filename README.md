# openclaw-odysseus-plugins

Production-grade [OpenClaw](https://github.com/openclaw/openclaw) plugins — conversational automation for the tasks you do every day.

> Ported and extended from [Odysseus](https://github.com/pewdiepie-archdaemon/odysseus). One command to install, zero model IDs hardcoded, works with whatever LLM you already run.

---

## What you can do today

### `email-triage` — your inbox, handled

Stop opening your email client. Ask your assistant instead:

```
you: anything urgent in my inbox?

assistant: 3 urgent emails:
  [3/3] CFO – "Q2 numbers need sign-off by EOD"    (finance, action-required)
  [2/3] Legal – "NDA redlines attached"             (legal, review)
  [2/3] Recruiter – "Offer for Singh — due tomorrow" (hr, time-sensitive)

  15 other unread emails (low urgency). Want summaries or draft replies?
```

```
you: draft a reply to the CFO, keep it short

assistant: Draft (not sent):
  Subject: Re: Q2 numbers

  On it — reviewing now, will send sign-off by 4pm. Anything specific to flag?

  Send this? (yes / edit / discard)
```

Every reply is **drafted, not sent.** You approve before anything leaves your outbox.

**Install in one command:**

```bash
openclaw plugins install email-triage --marketplace lazyredditor/openclaw-odysseus-plugins
```

→ Full docs: [`packages/email-triage`](packages/email-triage)

---

## Why this repo

Most AI email tools are SaaS wrappers that read your inbox on their servers. This is different:

- **Runs locally** on your OpenClaw install — no data leaves your machine
- **Learns your voice** — feed it a handful of sent emails and it drafts in your style
- **Any LLM** — uses whatever model your OpenClaw is configured with (GPT-4o, Claude, Llama, anything)
- **Any mailbox** — IMAP/SMTP, Gmail OAuth, or Composio; one config block
- **Proactive alerts** — optional cron that pings you when urgent mail arrives, de-duplicated

---

## Plugins

| Plugin | Install name | What it does |
|---|---|---|
| [email-triage](packages/email-triage) | `email-triage` | Triage inbox, urgency scoring (0–3), spam detection, style-matched draft replies |

More coming. PRs welcome.

---

## Quickstart

**1. Install a plugin:**

```bash
openclaw plugins install email-triage --marketplace lazyredditor/openclaw-odysseus-plugins
```

**2. Add one account to `openclaw.json`:**

```jsonc
{
  "plugins": {
    "entries": {
      "email-triage": {
        "enabled": true,
        "config": {
          "accounts": [{
            "id": "primary",
            "provider": "imap",
            "host": "imap.gmail.com",
            "user": "you@gmail.com",
            "pass": "${EMAIL_APP_PASSWORD}",
            "smtpHost": "smtp.gmail.com",
            "smtpPort": 465
          }]
        }
      }
    }
  }
}
```

**3. Ask your assistant anything:**

```
"anything urgent in my email?"
"summarize the thread from legal"
"draft a reply saying I'll get back to them Monday"
"teach yourself my writing style from my last 20 sent emails"
```

---

## Contributing

This is a monorepo. Each plugin lives in `packages/<name>/`. To add a new plugin, copy the `email-triage` structure — `openclaw.plugin.json`, an `index.ts` extension entry point, and a `skills/` directory for prompts.

```
packages/
  email-triage/
    index.ts              # tool implementations
    openclaw.plugin.json  # manifest + config schema
    skills/               # prompt files loaded by the assistant
    docs/                 # cron recipes, advanced config
```

## License

MIT — see [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for Odysseus attribution.
