import type { Mail } from "../providers/types.js";
import type { Verdict } from "../taxonomy.js";
/** The host LLM, injected as a single-prompt function. No model is ever named
 *  here — the host resolves its own default/fallback chain. */
export type LlmFn = (prompt: string) => Promise<string>;
export declare function classifyEmail(mail: Mail, urgencyRules: string, llm: LlmFn): Promise<Verdict>;
