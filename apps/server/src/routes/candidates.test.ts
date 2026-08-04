import { describe, test, expect, mock } from "bun:test";
import { app } from "../index";

describe("GET /api/candidates", () => {
  test("selects candidate columns aliased to the Candidate shape", async () => {
    const prepare = mock(() => ({
      bind: mock(() => ({
        all: mock(() => Promise.resolve({
          results: [{ id: "c1", name: "Alice" }],
        })),
      })),
    }));
    const env = { DB: { prepare }, ELECTION_ID: "test-election" } as unknown as Env;

    await app.request("/api/candidates", {}, env);

    // proves the ROUTE asks D1 for camelCase-aliased columns —
    // not that D1 actually returns them that way, which needs a real DB
    const sql = prepare.mock.calls[0][0] as string;
    expect(sql).toMatch(/image_src\s+AS\s+imageSrc/i);
    expect(sql).toMatch(/youtube_link\s+AS\s+youtubeLink/i);
    expect(sql).toMatch(/facebook_link\s+AS\s+facebookLink/i);
  });
});