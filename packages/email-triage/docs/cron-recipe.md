# Proactive triage via OpenClaw cron

External plugins can't self-schedule, so use a native OpenClaw cron job that runs an
agent turn which calls `triage_inbox` and delivers urgent mail to your session.
Nothing below is specific to any deployment.

```bash
openclaw cron add \
  --every 1h \
  --session isolated \
  --prompt "Run email triage: call triage_inbox. If there are urgent emails, message me a short list (sender, subject, why urgent). If nothing is urgent, stay silent."
```

Tune `--every` (e.g. `30m`, `2h`), `--session`, and delivery to taste. The plugin
de-duplicates alerts internally, so you won't be pinged twice for the same email.
