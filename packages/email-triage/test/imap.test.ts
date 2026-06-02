import { describe, it, expect, vi } from "vitest";
import { ImapProvider } from "../src/providers/imap.js";

function fakeImap() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    getMailboxLock: vi.fn().mockResolvedValue({ release() {} }),
    search: vi.fn().mockResolvedValue([101]),
    fetchOne: vi.fn().mockResolvedValue({
      uid: 101,
      envelope: { messageId: "<m1>", from: [{ address: "a@b.com" }], subject: "Hi" },
      source: Buffer.from("List-Unsubscribe: <x>\r\n\r\nbody text"),
    }),
  };
}

describe("ImapProvider", () => {
  it("lists unread since N days", async () => {
    const imap = fakeImap();
    const p = new ImapProvider({ id: "acc" } as any, { imap: imap as any, transport: {} as any });
    const refs = await p.listUnread(7);
    expect(imap.search).toHaveBeenCalled();
    expect(refs[0].uid).toBe("101");
    expect(refs[0].messageId).toBe("<m1>");
    expect(refs[0].from).toBe("a@b.com");
  });

  it("fetches the body after the header block", async () => {
    const imap = fakeImap();
    const p = new ImapProvider({ id: "acc" } as any, { imap: imap as any });
    const mail = await p.fetchMessage({ uid: "101", messageId: "<m1>", from: "a@b.com", subject: "Hi", headers: "" });
    expect(mail.body).toBe("body text");
  });

  it("sends a reply via the transport", async () => {
    const transport = { sendMail: vi.fn().mockResolvedValue({ messageId: "<r1>" }) };
    const p = new ImapProvider({ id: "acc", from: "me@b.com" } as any, { imap: fakeImap() as any, transport: transport as any });
    const res = await p.sendReply(
      { from: "a@b.com", subject: "Hi", messageId: "<m1>", uid: "1", headers: "", body: "" },
      "thanks",
    );
    expect(transport.sendMail).toHaveBeenCalled();
    expect(res.id).toBe("<r1>");
  });
});
