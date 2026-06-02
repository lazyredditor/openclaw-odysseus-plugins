import { describe, it, expect } from "vitest";
import { CATEGORY_TAGS, MANAGED_TAGS, normalizeTag, isUrgent } from "../src/taxonomy.js";

describe("taxonomy", () => {
  it("aliases promo to marketing", () => {
    expect(normalizeTag("promo")).toBe("marketing");
  });
  it("normalizes underscores and case", () => {
    expect(normalizeTag("Reply_Soon")).toBe("reply-soon");
  });
  it("keeps known category tags", () => {
    expect(CATEGORY_TAGS.has("newsletter")).toBe(true);
  });
  it("managed tags include urgent + reply-soon + categories", () => {
    expect(MANAGED_TAGS.has("urgent")).toBe(true);
    expect(MANAGED_TAGS.has("reply-soon")).toBe(true);
    expect(MANAGED_TAGS.has("newsletter")).toBe(true);
  });
  it("isUrgent at threshold 2", () => {
    expect(isUrgent(2, 2)).toBe(true);
    expect(isUrgent(1, 2)).toBe(false);
  });
});
