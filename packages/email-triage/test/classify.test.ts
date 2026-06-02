import { describe, it, expect } from "vitest";
import { classifyEmail } from "../src/engine/classify.js";

const mail = { uid: "1", messageId: "<m>", from: "boss@co", subject: "deadline today", body: "need it by 5pm", headers: "" };

describe("classifyEmail", () => {
  it("returns the LLM verdict after overrides", async () => {
    const llm = async () => '{"score":2,"tags":["work"],"spam":false,"reason":"deadline"}';
    const v = await classifyEmail(mail, "rules", llm);
    expect(v.score).toBe(2);
    expect(v.tags).toContain("work");
  });
  it("applies the outside override even if the model says 1", async () => {
    const llm = async () => '{"score":1,"tags":[],"spam":false,"reason":"x"}';
    const v = await classifyEmail({ ...mail, body: "I'm outside the door" }, "rules", llm);
    expect(v.score).toBe(3);
  });
  it("calls the llm with a single prompt argument (no model)", async () => {
    let argCount = -1;
    const llm = async (...args: unknown[]) => { argCount = args.length; return '{"score":0,"tags":[],"spam":false,"reason":""}'; };
    await classifyEmail(mail, "rules", llm as (p: string) => Promise<string>);
    expect(argCount).toBe(1);
  });
});
