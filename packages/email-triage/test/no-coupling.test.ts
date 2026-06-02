import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    if (["node_modules", "dist", "test"].includes(f)) return [];
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("no deployment coupling", () => {
  const files = walk(join(root, "src")).concat([join(root, "index.ts")]).filter((f) => f.endsWith(".ts"));
  const forbidden: RegExp[] = [
    /zai\//i,
    /glm-4/i,
    /claude-(opus|sonnet|haiku)/i,
    /gpt-[45]/i,
    /manocha|bhavuk/i,
    /\/home\/node\/\.openclaw/i,
  ];
  it("contains no hardcoded model ids, identities, or deployment paths", () => {
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      for (const re of forbidden) {
        expect(re.test(src), `forbidden pattern ${re} found in ${f}`).toBe(false);
      }
    }
  });
});
