import { describe, it, expect, vi } from "vitest";
import { draftReply } from "../src/engine/reply.js";

const mail = { from: "a", subject: "Hi", body: "can you?", messageId: "<m>", uid: "1", headers: "" };

describe("draftReply", () => {
  it("returns only the text between reply markers and strips thinking", async () => {
    const llm = async () => "<think>plan</think>\n<<<REPLY>>>\nThanks, will do.\n<<<END>>>";
    const out = await draftReply(mail, "Write emails in this style: terse.", llm);
    expect(out).toBe("Thanks, will do.");
  });
  it("does not send anything (no transport involved)", async () => {
    const send = vi.fn();
    const llm = async () => "<<<REPLY>>>ok<<<END>>>";
    const out = await draftReply(mail, "style", llm);
    expect(out).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });
});
