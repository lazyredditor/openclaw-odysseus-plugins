import type { MailProvider } from "./types.js";
import type { AccountConfig } from "../config.js";
import { ImapProvider } from "./imap.js";
import { GmailProvider } from "./gmail.js";
import { ComposioProvider } from "./composio.js";

export function makeProvider(acc: AccountConfig): MailProvider {
  switch (acc.provider) {
    case "imap":
      return new ImapProvider(acc);
    case "gmail":
      return new GmailProvider(acc);
    case "composio":
      return new ComposioProvider(acc);
    default:
      throw new Error(`provider not available: ${(acc as { provider: string }).provider}`);
  }
}
