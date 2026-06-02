import type { LlmFn } from "./classify.js";
import { STYLE_EXTRACT_PROMPT } from "../prompts.js";
import { stripThink } from "../parse.js";

export async function extractStyle(sentSamples: string[], llm: LlmFn): Promise<string> {
  const raw = await llm(`${STYLE_EXTRACT_PROMPT}\n\nSamples:\n${sentSamples.join("\n---\n")}`);
  return stripThink(raw).trim();
}
