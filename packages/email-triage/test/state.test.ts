import { describe, it, expect } from "vitest";
import { makeTriageState, type KeyedStore } from "../src/state.js";

function memStore(): KeyedStore {
  const m = new Map<string, unknown>();
  return {
    async get(k) { return m.get(k); },
    async set(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
  };
}

describe("triage state", () => {
  it("caches and reads a verdict by account+messageId", async () => {
    const s = makeTriageState(memStore());
    expect(await s.getVerdict("acc", "<id1>")).toBeUndefined();
    await s.setVerdict("acc", "<id1>", { score: 2, tags: ["work"], spam: false, reason: "x" });
    expect((await s.getVerdict("acc", "<id1>"))?.score).toBe(2);
  });
  it("tracks notified uids and prunes to still-unread", async () => {
    const s = makeTriageState(memStore());
    await s.markNotified("acc", "u1");
    await s.markNotified("acc", "u2");
    expect(await s.isNotified("acc", "u1")).toBe(true);
    await s.pruneNotified("acc", ["u2"]); // u1 no longer unread
    expect(await s.isNotified("acc", "u1")).toBe(false);
    expect(await s.isNotified("acc", "u2")).toBe(true);
  });
  it("stores writing style per account", async () => {
    const s = makeTriageState(memStore());
    await s.setStyle("acc", "Write emails in this style: terse.");
    expect(await s.getStyle("acc")).toContain("terse");
  });
});
