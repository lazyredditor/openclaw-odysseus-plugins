import { Type, type Static } from "typebox";
export declare const ImapAccountSchema: Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"imap">;
    host: Type.TString;
    port: Type.TOptional<Type.TNumber>;
    secure: Type.TOptional<Type.TBoolean>;
    user: Type.TString;
    pass: Type.TString;
    smtpHost: Type.TOptional<Type.TString>;
    smtpPort: Type.TOptional<Type.TNumber>;
    from: Type.TOptional<Type.TString>;
}>;
export declare const GmailAccountSchema: Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"gmail">;
    user: Type.TString;
    clientId: Type.TString;
    clientSecret: Type.TString;
    refreshToken: Type.TString;
}>;
export declare const ComposioAccountSchema: Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"composio">;
    user: Type.TString;
    apiKey: Type.TString;
    connectedAccountId: Type.TString;
    baseUrl: Type.TOptional<Type.TString>;
}>;
export declare const AccountSchema: Type.TUnion<[Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"imap">;
    host: Type.TString;
    port: Type.TOptional<Type.TNumber>;
    secure: Type.TOptional<Type.TBoolean>;
    user: Type.TString;
    pass: Type.TString;
    smtpHost: Type.TOptional<Type.TString>;
    smtpPort: Type.TOptional<Type.TNumber>;
    from: Type.TOptional<Type.TString>;
}>, Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"gmail">;
    user: Type.TString;
    clientId: Type.TString;
    clientSecret: Type.TString;
    refreshToken: Type.TString;
}>, Type.TObject<{
    id: Type.TString;
    provider: Type.TLiteral<"composio">;
    user: Type.TString;
    apiKey: Type.TString;
    connectedAccountId: Type.TString;
    baseUrl: Type.TOptional<Type.TString>;
}>]>;
export declare const ConfigSchema: Type.TObject<{
    accounts: Type.TArray<Type.TUnion<[Type.TObject<{
        id: Type.TString;
        provider: Type.TLiteral<"imap">;
        host: Type.TString;
        port: Type.TOptional<Type.TNumber>;
        secure: Type.TOptional<Type.TBoolean>;
        user: Type.TString;
        pass: Type.TString;
        smtpHost: Type.TOptional<Type.TString>;
        smtpPort: Type.TOptional<Type.TNumber>;
        from: Type.TOptional<Type.TString>;
    }>, Type.TObject<{
        id: Type.TString;
        provider: Type.TLiteral<"gmail">;
        user: Type.TString;
        clientId: Type.TString;
        clientSecret: Type.TString;
        refreshToken: Type.TString;
    }>, Type.TObject<{
        id: Type.TString;
        provider: Type.TLiteral<"composio">;
        user: Type.TString;
        apiKey: Type.TString;
        connectedAccountId: Type.TString;
        baseUrl: Type.TOptional<Type.TString>;
    }>]>>;
    scanWindowDays: Type.TOptional<Type.TNumber>;
    urgencyRules: Type.TOptional<Type.TString>;
    alertThreshold: Type.TOptional<Type.TNumber>;
    model: Type.TOptional<Type.TUnion<[Type.TString, Type.TNull]>>;
    spamMove: Type.TOptional<Type.TBoolean>;
    selfHeader: Type.TOptional<Type.TString>;
}>;
export type ImapAccount = Static<typeof ImapAccountSchema>;
export type GmailAccount = Static<typeof GmailAccountSchema>;
export type ComposioAccount = Static<typeof ComposioAccountSchema>;
export type AccountConfig = Static<typeof AccountSchema>;
export type Config = Static<typeof ConfigSchema>;
