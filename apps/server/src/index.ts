import { Hono } from "hono";
import { voteRoute } from "./routes/vote";
import { resultsRoute } from "./routes/results";
import { candidatesRoute } from "./routes/candidates";
import { recomputeResults } from "./cron/recompute-results";
import { cors } from "hono/cors";
const app = new Hono<{ Bindings: Env }>();
app.route("/", voteRoute);
app.route("/", resultsRoute);
app.route("/", candidatesRoute);

app.use("/api/*", cors({ origin: ["http://localhost:4321"], credentials: true }));

export { app };

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(recomputeResults(env));
  },
};

export { VoteGate } from "./durable-objects/vote-gate";