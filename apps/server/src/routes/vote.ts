import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { verifyTurnstile } from "../lib/turnstile";
import { hashVoterIdentity } from "../lib/voter-hash";

export const voteRoute = new Hono<{ Bindings: Env }>();

voteRoute.post("/api/vote/:candidateId", async (c) => {
  const { candidateId } = c.req.param();
  const { turnstileToken } = await c.req.json<{ turnstileToken: string }>();

  if (!turnstileToken) {
    return c.json({ error: "missing_turnstile_token" }, 400);
  }

  const ip = c.req.header("CF-Connecting-IP");
  if (!ip) {
    // shouldn't happen behind Cloudflare's own edge, but fail closed rather
    // than silently hashing "unknown" into a shared bucket for every voter
    return c.json({ error: "missing_ip" }, 400);
  }

  const verified = await verifyTurnstile(turnstileToken, c.env.TURNSTILE_SECRET, ip);
  if (!verified) {
    return c.json({ error: "verification_failed" }, 403);
  }

  const voterHash = await hashVoterIdentity(ip, c.env.VOTER_HASH_SECRET);

  const gateId = c.env.VOTE_GATE.idFromName(`${c.env.ELECTION_ID}:${voterHash}`);
  const claim = await c.env.VOTE_GATE.get(gateId).fetch("https://gate/claim", { method: "POST" });
  if (claim.status === 409) {
    return c.json({ error: "already_voted" }, 409);
  }

  // Belt-and-suspenders: the DO already prevents this, but the unique
  // index means a bug in the DO logic can't silently produce a duplicate
  // row either. If this insert throws on the constraint, something's
  // wrong with the DO gate above, not with this candidate's vote count.
  try {
    await c.env.DB.prepare(
      `INSERT INTO votes (id, candidate_id, election_id, voter_hash, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), candidateId, c.env.ELECTION_ID, voterHash, Date.now()).run();
  } catch (err) {
    console.error("vote insert failed after DO claim succeeded", err);
    return c.json({ error: "vote_not_recorded" }, 500);
  }

  setCookie(c, "voted", "1", {
    httpOnly: true,
    sameSite: "Strict",
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  return c.json({ ok: true });
});