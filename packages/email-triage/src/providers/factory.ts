import type { MailProvider } from "./types.js";
import type { AccountConfig } from "../config.js";
import { ImapProvider } from "./imap.js";

export function makeProvider(acc: AccountConfig): MailProvider {
  switch (acc.provider) {
    case "imap":
      return new ImapProvider(acc);
    default:
      throw new Error(`provider not available in P1: ${(acc as { provider: string }).provider}`);
  }
}
