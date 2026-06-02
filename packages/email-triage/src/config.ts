import { Type, type Static } from "typebox";

export const ImapAccountSchema = Type.Object(
  {
    id: Type.String(),
    provider: Type.Literal("imap"),
    host: Type.String(),
    port: Type.Optional(Type.Number()),
    secure: Type.Optional(Type.Boolean()),
    user: Type.String(),
    pass: Type.String(), // env-referenced by the operator; never committed
    smtpHost: Type.Optional(Type.String()),
    smtpPort: Type.Optional(Type.Number()),
    from: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

// P2 will union gmail/composio account schemas here.
export const AccountSchema = ImapAccountSchema;

export const ConfigSchema = Type.Object(
  {
    accounts: Type.Array(AccountSchema),
    scanWindowDays: Type.Optional(Type.Number({ default: 7 })),
    urgencyRules: Type.Optional(Type.String()),
    alertThreshold: Type.Optional(Type.Number({ default: 2 })),
    model: Type.Optional(Type.Union([Type.String(), Type.Null()])), // null/absent => host default
    spamMove: Type.Optional(Type.Boolean({ default: false })),
    selfHeader: Type.Optional(Type.String({ default: "X-OpenClaw-Triage" })),
  },
  { additionalProperties: false },
);

export type ImapAccount = Static<typeof ImapAccountSchema>;
export type AccountConfig = Static<typeof AccountSchema>;
export type Config = Static<typeof ConfigSchema>;
