import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { app } from "../index";
const baseEnv = {
  DB: { prepare: mock() },
  VOTE_GATE: { idFromName: mock(), get: mock() },
  RESULTS_CACHE: {} as any,
  TURNSTILE_SECRET: "test-secret",
  VOTER_HASH_SECRET: "test-hmac-secret",
  ELECTION_ID: "test-election",
} as unknown as Env;

function mockDb(env: typeof baseEnv, runResult: any = { success: true }) {
  const run = mock(() => Promise.resolve(runResult));
  const bind = mock(() => ({ run }));
  env.DB.prepare = mock(() => ({ bind })) as any;
  return { prepare: env.DB.prepare, bind, run };
}

function mockGate(env: typeof baseEnv, status: number) {
  const fetchMock = mock(() => Promise.resolve(new Response(null, { status })));
  env.VOTE_GATE.idFromName = mock(() => "fake-do-id") as any;
  env.VOTE_GATE.get = mock(() => ({ fetch: fetchMock })) as any;
  return fetchMock;
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockTurnstile(success: boolean) {
  globalThis.fetch = mock(() =>
    Promise.resolve(new Response(JSON.stringify({ success }), { status: 200 }))
  ) as any;
}

describe("POST /api/vote/:candidateId", () => {
  test("rejects a request with no turnstile token", async () => {
      const env = { ...baseEnv };
      const res = await app.request(
      "/api/vote/candidate-1",
      { method: "POST", body: JSON.stringify({}), headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" } },
      env
    );
    expect(res.status).toBe(400);
  });

  test("rejects a request with no resolvable IP", async () => {
    const env = { ...baseEnv };
    const res = await app.request(
      "/api/vote/candidate-1",
      { method: "POST", body: JSON.stringify({ turnstileToken: "tok" }), headers: { "Content-Type": "application/json" } },
      env
    );
    expect(res.status).toBe(400);
  });

  test("rejects when turnstile verification fails", async () => {
    mockTurnstile(false);
    const env = { ...baseEnv };
    const res = await app.request(
      "/api/vote/candidate-1",
      { method: "POST", body: JSON.stringify({ turnstileToken: "tok" }), headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" } },
      env
    );
    expect(res.status).toBe(403);
  });

  test("returns 409 and never touches D1 if the voter already claimed", async () => {
    mockTurnstile(true);
    const env = { ...baseEnv };
    mockGate(env, 409);
    const db = mockDb(env);

    const res = await app.request(
      "/api/vote/candidate-1",
      { method: "POST", body: JSON.stringify({ turnstileToken: "tok" }), headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" } },
      env
    );

    expect(res.status).toBe(409);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  test("records a vote and sets the cookie on the happy path", async () => {
    mockTurnstile(true);
    const env = { ...baseEnv };
    mockGate(env, 200);
    const db = mockDb(env);

    const res = await app.request(
      "/api/vote/candidate-1",
      { method: "POST", body: JSON.stringify({ turnstileToken: "tok" }), headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.2.3.4" } },
      env
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.run).toHaveBeenCalledTimes(1);
    expect(res.headers.get("set-cookie")).toContain("voted=1");
  });
});