import { Type } from "typebox";
export const ImapAccountSchema = Type.Object({
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
}, { additionalProperties: false });
export const GmailAccountSchema = Type.Object({
    id: Type.String(),
    provider: Type.Literal("gmail"),
    user: Type.String(), // the gmail address (used as the From)
    clientId: Type.String(),
    clientSecret: Type.String(),
    refreshToken: Type.String(),
}, { additionalProperties: false });
export const ComposioAccountSchema = Type.Object({
    id: Type.String(),
    provider: Type.Literal("composio"),
    user: Type.String(), // mailbox address (used as the From)
    apiKey: Type.String(),
    connectedAccountId: Type.String(),
    baseUrl: Type.Optional(Type.String()),
}, { additionalProperties: false });
export const AccountSchema = Type.Union([ImapAccountSchema, GmailAccountSchema, ComposioAccountSchema]);
export const ConfigSchema = Type.Object({
    accounts: Type.Array(AccountSchema),
    scanWindowDays: Type.Optional(Type.Number({ default: 7 })),
    urgencyRules: Type.Optional(Type.String()),
    alertThreshold: Type.Optional(Type.Number({ default: 2 })),
    model: Type.Optional(Type.Union([Type.String(), Type.Null()])), // null/absent => host default
    spamMove: Type.Optional(Type.Boolean({ default: false })),
    selfHeader: Type.Optional(Type.String({ default: "X-OpenClaw-Triage" })),
}, { additionalProperties: false });
