import { describe, it, expect, vi } from "vitest";
import { ComposioProvider } from "../src/providers/composio.js";

describe("ComposioProvider", () => {
  it("maps GMAIL_FETCH_EMAILS results to MailRefs", async () => {
    const exec = vi.fn().mockResolvedValue({ messages: [{ message_id: "<m1>", sender: "a@b.com", subject: "Hi" }] });
    const p = new ComposioProvider({ id: "acc", user: "me@b.com" } as any, exec);
    const refs = await p.listUnread(7);
    expect(exec).toHaveBeenCalledWith("GMAIL_FETCH_EMAILS", expect.objectContaining({ query: "is:unread newer_than:7d" }));
    expect(refs[0].messageId).toBe("<m1>");
    expect(refs[0].from).toBe("a@b.com");
  });
  it("fetches a message body", async () => {
    const exec = vi.fn().mockResolvedValue({ body: "hello world" });
    const p = new ComposioProvider({ id: "acc", user: "me@b.com" } as any, exec);
    const mail = await p.fetchMessage({ uid: "m1", messageId: "<m1>", from: "a@b.com", subject: "Hi", headers: "" });
    expect(mail.body).toBe("hello world");
  });
  it("sends a reply via GMAIL_SEND_EMAIL", async () => {
    const exec = vi.fn().mockResolvedValue({ id: "sent1" });
    const p = new ComposioProvider({ id: "acc", user: "me@b.com" } as any, exec);
    const res = await p.sendReply({ from: "a@b.com", subject: "Hi", messageId: "<m1>", uid: "1", headers: "", body: "" }, "thanks");
    expect(exec).toHaveBeenCalledWith("GMAIL_SEND_EMAIL", expect.objectContaining({ recipient_email: "a@b.com", body: "thanks" }));
    expect(res.id).toBe("sent1");
  });
});
