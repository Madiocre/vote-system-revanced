import { describe, test, expect, mock } from "bun:test";
import { app } from "../index";

function makeEnv(cachedValue: string | null) {
  const get = mock(() => Promise.resolve(cachedValue));
  return { RESULTS_CACHE: { get }, ELECTION_ID: "test-election" } as unknown as Env;
}

describe("GET /api/results", () => {
  test("returns empty results before the first cron tick", async () => {
    const env = makeEnv(null);
    const res = await app.request("/api/results", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updatedAt: null, results: [] });
  });

  test("returns the cached results as-is", async () => {
    const payload = { updatedAt: 12345, results: [{ candidateId: "c1", name: "Alice", count: 5 }] };
    const env = makeEnv(JSON.stringify(payload));
    const res = await app.request("/api/results", {}, env);
    expect(await res.json()).toEqual(payload);
  });

  test("falls back to empty results if the cache entry is corrupted", async () => {
    const env = makeEnv("{not valid json");
    const res = await app.request("/api/results", {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ updatedAt: null, results: [] });
  });

  test("reads the key scoped to ELECTION_ID, not a flat key", async () => {
    const env = makeEnv(null);
    await app.request("/api/results", {}, env);
    expect((env.RESULTS_CACHE.get as any).mock.calls[0][0]).toBe("results:test-election");
  });
});