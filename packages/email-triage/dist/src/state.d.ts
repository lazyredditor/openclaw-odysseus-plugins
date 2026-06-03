import type { Verdict } from "./taxonomy.js";
/** Minimal store contract. OpenClaw's `api.runtime.state.openKeyedStore`
 *  satisfies this; tests pass an in-memory implementation. */
export interface KeyedStore {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
    delete(key: string): Promise<void>;
}
export declare function makeTriageState(store: KeyedStore): {
    getVerdict(acc: string, id: string): Promise<Verdict | undefined>;
    setVerdict(acc: string, id: string, v: Verdict): Promise<void>;
    isNotified(acc: string, uid: string): Promise<boolean>;
    markNotified(acc: string, uid: string): Promise<void>;
    pruneNotified(acc: string, stillUnread: string[]): Promise<void>;
    getStyle(acc: string): Promise<string | undefined>;
    setStyle(acc: string, style: string): Promise<void>;
};
export type TriageState = ReturnType<typeof makeTriageState>;
