# openclaw-email-triage

Triage your inbox from OpenClaw: classify each unread email (urgency 0–3, category
tags, spam), summarize it, and draft replies in your own writing style — you approve
before anything is sent. Ported from [Odysseus](https://github.com/pewdiepie-archdaemon/odysseus).

**Deployment-agnostic by design:** no model IDs, channels, accounts, or paths are
hardcoded. It uses whatever LLM provider your OpenClaw is configured with, and runs
on a stock OpenClaw install with no source patches.

## Install (one command)

From the public marketplace repo (works today — verified on OpenClaw 2026.5.28):

```bash
openclaw plugins install email-triage --marketplace lazyredditor/openclaw-odysseus-plugins
```

Or, once published to npm:

```bash
openclaw plugins install npm:openclaw-email-triage
```

Then enable it with one account in `openclaw.json` (or via the Control UI):

```jsonc
{
  "plugins": {
    "entries": {
      "email-triage": {
        "enabled": true,
        "config": {
          "accounts": [
            {
              "id": "primary",
              "provider": "imap",
              "host": "imap.gmail.com",
              "user": "you@example.com",
              "pass": "${EMAIL_APP_PASSWORD}",
              "smtpHost": "smtp.gmail.com",
              "smtpPort": 465
            }
          ]
        }
      }
    }
  }
}
```

Put the app password in your environment as `EMAIL_APP_PASSWORD` (use an app
password, never your login password). That's the whole setup — now ask your
assistant *"anything urgent in my email?"*.

### Other providers

Instead of raw IMAP you can use a `gmail` (OAuth) or `composio` account in the same
`accounts` array:

```jsonc
// Gmail via OAuth
{ "id": "gmail", "provider": "gmail", "user": "you@gmail.com",
  "clientId": "${GOOGLE_CLIENT_ID}", "clientSecret": "${GOOGLE_CLIENT_SECRET}",
  "refreshToken": "${GOOGLE_REFRESH_TOKEN}" }

// Composio (routes Gmail actions through your Composio connection)
{ "id": "composio", "provider": "composio", "user": "you@gmail.com",
  "apiKey": "${COMPOSIO_API_KEY}", "connectedAccountId": "${COMPOSIO_CONNECTED_ACCOUNT_ID}" }
```

> The Composio adapter's action names/response shapes follow Composio's documented
> `GMAIL_*` actions but have not been verified against a live connection yet —
> prefer `imap` or `gmail` for now.

## Tools

| Tool | What it does |
| --- | --- |
| `triage_inbox` | Scan unread mail; return urgent items with summaries |
| `summarize_email` | Summarize one email into 1–3 bullets |
| `draft_reply` | Draft a style-matched reply (does **not** send) |
| `send_reply` | Send a reply you've reviewed and approved |
| `set_writing_style` | Teach it your writing style from past sent emails |

## Proactive alerts (optional)

To be pinged when urgent mail arrives, add a cron job — see
[docs/cron-recipe.md](docs/cron-recipe.md). Alerts are de-duplicated, so you won't
be notified twice for the same email.

## Config reference

| key | default | meaning |
| --- | --- | --- |
| `accounts[]` | — | one or more IMAP/SMTP accounts (required) |
| `scanWindowDays` | `7` | how far back to scan unread mail |
| `urgencyRules` | sensible default | natural-language rules for what counts as urgent |
| `alertThreshold` | `2` | minimum score (0–3) to treat as urgent |
| `model` | host default | optional model pin; omit to use your OpenClaw's configured model |
| `spamMove` | `false` | move detected spam to a folder |
| `selfHeader` | `X-OpenClaw-Triage` | header used to skip the assistant's own mail |

## License

MIT. See [ACKNOWLEDGMENTS](../../ACKNOWLEDGMENTS.md) for Odysseus attribution.
