import { STYLE_EXTRACT_PROMPT } from "../prompts.js";
import { stripThink } from "../parse.js";
export async function extractStyle(sentSamples, llm) {
    const raw = await llm(`${STYLE_EXTRACT_PROMPT}\n\nSamples:\n${sentSamples.join("\n---\n")}`);
    return stripThink(raw).trim();
}
