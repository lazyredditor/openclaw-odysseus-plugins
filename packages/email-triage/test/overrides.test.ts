import { describe, it, expect } from "vitest";
import { applyOverrides } from "../src/overrides.js";
import type { Verdict } from "../src/taxonomy.js";

const base: Verdict = { score: 0, tags: [], spam: false, reason: "" };

describe("deterministic overrides", () => {
  it("forces score 3 when body says I'm outside", () => {
    const v = applyOverrides({ ...base, score: 1 }, { from: "wife", subject: "hey", body: "I'm outside, open the door" });
    expect(v.score).toBe(3);
    expect(v.reason).toBe("person is waiting outside");
  });
  it("forces score 3 for 'at the door' / 'locked out'", () => {
    expect(applyOverrides({ ...base }, { from: "x", subject: "", body: "I am at the door" }).score).toBe(3);
    expect(applyOverrides({ ...base }, { from: "x", subject: "", body: "locked out, help" }).score).toBe(3);
  });
  it("adds newsletter tag on list-unsubscribe header", () => {
    const v = applyOverrides({ ...base, score: 1 }, { from: "x", subject: "Weekly", body: "...", headers: "List-Unsubscribe: <mailto:u>" });
    expect(v.tags).toContain("newsletter");
  });
  it("adds marketing tag on sale language", () => {
    const v = applyOverrides({ ...base, score: 1 }, { from: "x", subject: "50% OFF SALE", body: "shop now" });
    expect(v.tags).toContain("marketing");
  });
  it("floors bulk/marketing under score 2 to 0", () => {
    const v = applyOverrides({ ...base, score: 1, tags: ["marketing"] }, { from: "x", subject: "promo", body: "buy" });
    expect(v.score).toBe(0);
  });
  it("does NOT floor marketing when score is already >= 2", () => {
    const v = applyOverrides({ ...base, score: 2, tags: ["marketing"] }, { from: "x", subject: "promo", body: "buy" });
    expect(v.score).toBe(2);
  });
});
