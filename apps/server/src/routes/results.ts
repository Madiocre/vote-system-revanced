import { Hono } from "hono";

export const resultsRoute = new Hono<{ Bindings: Env }>();

resultsRoute.get("/api/results", async (c) => {
  const cached = await c.env.RESULTS_CACHE.get(`results:${c.env.ELECTION_ID}`);

  if (!cached) {
    // normal right after a fresh deploy, before the first cron tick fires —
    // not an error state, just "nothing computed yet"
    return c.json({ updatedAt: null, results: [] });
  }

  try {
    return c.json(JSON.parse(cached));
  } catch (err) {
    console.error("results cache contained invalid JSON", err);
    return c.json({ updatedAt: null, results: [] });
  }
});