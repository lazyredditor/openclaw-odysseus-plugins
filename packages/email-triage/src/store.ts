import { promises as fsp } from "node:fs";
import { dirname } from "node:path";
import type { KeyedStore } from "./state.js";

/** A JSON-file-backed KeyedStore (one file holding a key→value map).
 *  OpenClaw's `openKeyedStore` is restricted to trusted plugins, so external
 *  plugins persist via the state dir instead. */
export function fileKeyedStore(file: string): KeyedStore {
  let cache: Record<string, unknown> | null = null;
  async function load(): Promise<Record<string, unknown>> {
    if (cache) return cache;
    try {
      cache = JSON.parse(await fsp.readFile(file, "utf8")) as Record<string, unknown>;
    } catch {
      cache = {};
    }
    return cache;
  }
  async function persist(): Promise<void> {
    await fsp.mkdir(dirname(file), { recursive: true });
    await fsp.writeFile(file, JSON.stringify(cache ?? {}));
  }
  return {
    async get(k) {
      return (await load())[k];
    },
    async set(k, v) {
      (await load())[k] = v;
      await persist();
    },
    async delete(k) {
      delete (await load())[k];
      await persist();
    },
  };
}
