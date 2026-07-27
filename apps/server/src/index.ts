import { Hono } from "hono";
import { voteRoute } from "./routes/vote";
import { recomputeResults } from "./cron/recompute-results";

const app = new Hono<{ Bindings: Env }>();
app.route("/", voteRoute);

export { app };

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(recomputeResults(env));
  },
};