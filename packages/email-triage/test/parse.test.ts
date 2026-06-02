import { describe, it, expect } from "vitest";
import { stripThink, parseVerdict } from "../src/parse.js";

describe("parse hardening", () => {
  it("strips <think> blocks", () => {
    expect(stripThink("<think>reasoning</think>{\"a\":1}")).toBe('{"a":1}');
  });
  it("parses clean verdict JSON", () => {
    const v = parseVerdict('{"score":3,"tags":["work"],"spam":false,"reason":"deadline"}');
    expect(v.score).toBe(3);
    expect(v.tags).toEqual(["work"]);
  });
  it("strips code fences", () => {
    const v = parseVerdict('```json\n{"score":2,"tags":["finance"],"spam":false,"reason":"bill"}\n```');
    expect(v.score).toBe(2);
    expect(v.tags).toEqual(["finance"]);
  });
  it("extracts JSON embedded in prose", () => {
    const v = parseVerdict('Here you go: {"score":1,"tags":[],"spam":false,"reason":"fyi"} done');
    expect(v.score).toBe(1);
  });
  it("drops unknown tags and dedupes", () => {
    const v = parseVerdict('{"score":1,"tags":["work","bogus","work"],"spam":false,"reason":"x"}');
    expect(v.tags).toEqual(["work"]);
  });
  it("repairs a truncated object by clamping to defaults", () => {
    const v = parseVerdict('{"score":2,"tags":["work"');
    expect(v.score).toBe(2);
    expect(Array.isArray(v.tags)).toBe(true);
  });
  it("falls back to a safe default on garbage", () => {
    const v = parseVerdict("not json at all");
    expect(v.score).toBe(0);
    expect(v.spam).toBe(false);
  });
});
