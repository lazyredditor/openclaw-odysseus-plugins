import type { KeyedStore } from "./state.js";
/** A JSON-file-backed KeyedStore (one file holding a key→value map).
 *  OpenClaw's `openKeyedStore` is restricted to trusted plugins, so external
 *  plugins persist via the state dir instead. */
export declare function fileKeyedStore(file: string): KeyedStore;
