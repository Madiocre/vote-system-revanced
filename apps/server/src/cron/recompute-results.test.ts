import { describe, test, expect, mock } from "bun:test";
import { recomputeResults } from "./recompute-results";

function makeEnv(candidates: any[], counts: any[]) {
  const batch = mock(() => Promise.resolve([{ results: candidates }, { results: counts }]));
  const put = mock(() => Promise.resolve());
  const prepare = mock(() => ({ bind: mock(() => ({})) }));

  return {
    env: { DB: { prepare, batch }, RESULTS_CACHE: { put }, ELECTION_ID: "test-election" } as unknown as Env,
    put,
  };
}

describe("recomputeResults", () => {
  test("zero-fills candidates with no votes", async () => {
    const { env, put } = makeEnv(
      [{ id: "c1", name: "Alice" }, { id: "c2", name: "Bob" }],
      [{ candidate_id: "c1", count: 5 }]
    );

    await recomputeResults(env);

    expect(put).toHaveBeenCalledTimes(1);
    const [key, value] = put.mock.calls[0];
    expect(key).toBe("results:test-election");
    expect(JSON.parse(value as string).results).toEqual([
      { candidateId: "c1", name: "Alice", count: 5 },
      { candidateId: "c2", name: "Bob", count: 0 },
    ]);
  });

  test("swallows a D1 failure instead of throwing", async () => {
    const put = mock();
    const env = {
        DB: {
        prepare: mock(() => ({ bind: mock(() => ({})) })),
        batch: mock(() => Promise.reject(new Error("d1 down"))),
        },
        RESULTS_CACHE: { put },
        ELECTION_ID: "test-election",
    } as unknown as Env;

    await expect(recomputeResults(env)).resolves.toBeUndefined();
    expect(put).not.toHaveBeenCalled();
  });
});