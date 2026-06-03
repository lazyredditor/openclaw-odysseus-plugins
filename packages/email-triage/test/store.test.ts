import { describe, it, expect } from "vitest";
import { fileKeyedStore } from "../src/store.js";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { rmSync } from "node:fs";

describe("fileKeyedStore", () => {
  it("persists across fresh instances and deletes", async () => {
    const file = join(tmpdir(), `et-store-test-${process.pid}.json`);
    try {
      const s1 = fileKeyedStore(file);
      await s1.set("a", { x: 1 });
      const s2 = fileKeyedStore(file); // fresh instance must read from disk
      expect(await s2.get("a")).toEqual({ x: 1 });
      await s2.delete("a");
      const s3 = fileKeyedStore(file);
      expect(await s3.get("a")).toBeUndefined();
    } finally {
      rmSync(file, { force: true });
    }
  });
});
