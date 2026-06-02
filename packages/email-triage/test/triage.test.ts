import { describe, it, expect } from "vitest";
import { triageInbox } from "../src/engine/triage.js";
import { makeTriageState, type KeyedStore } from "../src/state.js";
import type { Mail, MailProvider, MailRef } from "../src/providers/types.js";

function memStore(): KeyedStore {
  const m = new Map<string, unknown>();
  return { async get(k) { return m.get(k); }, async set(k, v) { m.set(k, v); }, async delete(k) { m.delete(k); } };
}
function fakeProvider(mails: Mail[]): MailProvider {
  return {
    async listUnread() { return mails.map(({ body: _body, ...r }) => r as MailRef); },
    async fetchMessage(ref) { return mails.find((m) => m.uid === ref.uid)!; },
    async sendReply() { return { id: "x" }; },
  };
}

const urgent: Mail = { uid: "1", messageId: "<u1>", from: "boss", subject: "deadline", body: "need by 5pm", headers: "" };
const fyi: Mail = { uid: "2", messageId: "<u2>", from: "list", subject: "Weekly", body: "news", headers: "List-Unsubscribe: <x>" };

function args(state: ReturnType<typeof makeTriageState>, mails: Mail[]) {
  const llm = async (p: string) =>
    p.includes("need by 5pm") // unique to the urgent email body (prompt boilerplate also says "deadline")
      ? '{"score":3,"tags":["work"],"spam":false,"reason":"deadline"}'
      : '{"score":1,"tags":["newsletter"],"spam":false,"reason":"fyi"}';
  return {
    accountId: "acc", provider: fakeProvider(mails), state, llm,
    urgencyRules: "r", scanWindowDays: 7, alertThreshold: 2,
    selfHeader: "X-OpenClaw-Triage", summarize: async () => "summary",
  };
}

describe("triageInbox", () => {
  it("returns urgent items new-to-notified, floors bulk, suppresses repeats", async () => {
    const state = makeTriageState(memStore());
    const res = await triageInbox(args(state, [urgent, fyi]));
    expect(res.urgent.map((u) => u.messageId)).toEqual(["<u1>"]);
    expect(res.items.find((i) => i.messageId === "<u2>")?.verdict.score).toBe(0);
    const res2 = await triageInbox(args(state, [urgent, fyi]));
    expect(res2.urgent).toHaveLength(0);
  });
  it("skips self-generated mail by header", async () => {
    const state = makeTriageState(memStore());
    const selfMail: Mail = { uid: "9", messageId: "<s>", from: "me", subject: "[Task] digest", body: "x", headers: "X-OpenClaw-Triage: 1" };
    const res = await triageInbox(args(state, [selfMail]));
    expect(res.items).toHaveLength(0);
  });
});
