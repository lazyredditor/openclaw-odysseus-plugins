import { describe, it, expect, vi } from "vitest";
import { GmailProvider } from "../src/providers/gmail.js";

function fakeGmail() {
  return {
    users: {
      messages: {
        list: vi.fn().mockResolvedValue({ data: { messages: [{ id: "m1" }] } }),
        get: vi.fn().mockImplementation(async ({ format }: { format: string }) => {
          if (format === "metadata") {
            return {
              data: {
                payload: {
                  headers: [
                    { name: "From", value: "a@b.com" },
                    { name: "Subject", value: "Hi" },
                    { name: "Message-ID", value: "<m1>" },
                  ],
                },
              },
            };
          }
          return { data: { payload: { mimeType: "text/plain", body: { data: Buffer.from("body text").toString("base64url") } } } };
        }),
        send: vi.fn().mockResolvedValue({ data: { id: "sent1" } }),
      },
    },
  };
}

describe("GmailProvider", () => {
  it("lists unread via the gmail query", async () => {
    const g = fakeGmail();
    const p = new GmailProvider({ id: "acc", user: "me@b.com" } as any, { gmail: g as any });
    const refs = await p.listUnread(7);
    expect(g.users.messages.list).toHaveBeenCalledWith({ userId: "me", q: "is:unread newer_than:7d" });
    expect(refs[0].from).toBe("a@b.com");
    expect(refs[0].messageId).toBe("<m1>");
  });
  it("decodes the plain-text body", async () => {
    const p = new GmailProvider({ id: "acc", user: "me@b.com" } as any, { gmail: fakeGmail() as any });
    const mail = await p.fetchMessage({ uid: "m1", messageId: "<m1>", from: "a@b.com", subject: "Hi", headers: "" });
    expect(mail.body).toBe("body text");
  });
  it("sends a base64url-encoded reply", async () => {
    const g = fakeGmail();
    const p = new GmailProvider({ id: "acc", user: "me@b.com" } as any, { gmail: g as any });
    const res = await p.sendReply({ from: "a@b.com", subject: "Hi", messageId: "<m1>", uid: "m1", headers: "", body: "" }, "thanks");
    expect(g.users.messages.send).toHaveBeenCalled();
    expect(res.id).toBe("sent1");
  });
});
