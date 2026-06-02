import type { Verdict } from "./taxonomy.js";

/** Minimal store contract. OpenClaw's `api.runtime.state.openKeyedStore`
 *  satisfies this; tests pass an in-memory implementation. */
export interface KeyedStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}

export function makeTriageState(store: KeyedStore) {
  const vkey = (acc: string, id: string) => `verdict:${acc}:${id}`;
  const nkey = (acc: string) => `notified:${acc}`;
  const skey = (acc: string) => `style:${acc}`;

  return {
    async getVerdict(acc: string, id: string): Promise<Verdict | undefined> {
      return (await store.get(vkey(acc, id))) as Verdict | undefined;
    },
    async setVerdict(acc: string, id: string, v: Verdict): Promise<void> {
      await store.set(vkey(acc, id), v);
    },
    async isNotified(acc: string, uid: string): Promise<boolean> {
      const set = ((await store.get(nkey(acc))) as string[] | undefined) ?? [];
      return set.includes(uid);
    },
    async markNotified(acc: string, uid: string): Promise<void> {
      const set = ((await store.get(nkey(acc))) as string[] | undefined) ?? [];
      if (!set.includes(uid)) await store.set(nkey(acc), [...set, uid]);
    },
    async pruneNotified(acc: string, stillUnread: string[]): Promise<void> {
      const keep = new Set(stillUnread);
      const set = ((await store.get(nkey(acc))) as string[] | undefined) ?? [];
      await store.set(nkey(acc), set.filter((u) => keep.has(u)));
    },
    async getStyle(acc: string): Promise<string | undefined> {
      return (await store.get(skey(acc))) as string | undefined;
    },
    async setStyle(acc: string, style: string): Promise<void> {
      await store.set(skey(acc), style);
    },
  };
}

export type TriageState = ReturnType<typeof makeTriageState>;
