export async function recomputeResults(env: Env): Promise<void> {
  try {
    const [candidatesResult, votesResult] = await env.DB.batch([
      env.DB.prepare(`SELECT id, name FROM candidates WHERE election_id = ?`).bind(env.ELECTION_ID),
      env.DB.prepare(
        `SELECT candidate_id, COUNT(*) as count FROM votes WHERE election_id = ? GROUP BY candidate_id`
      ).bind(env.ELECTION_ID),
    ]);

    const candidates = (candidatesResult?.results ?? []) as { id: string; name: string }[];
    const counts = (votesResult?.results ?? []) as { candidate_id: string; count: number }[];
    const countMap = new Map(counts.map((c) => [c.candidate_id, c.count]));

    const formatted = candidates.map((c) => ({
      candidateId: c.id,
      name: c.name,
      count: countMap.get(c.id) ?? 0, // the zero-fill from old results.ts, worth keeping
    }));

    await env.RESULTS_CACHE.put(
      `results:${env.ELECTION_ID}`,
      JSON.stringify({ updatedAt: Date.now(), results: formatted })
    );
  } catch (err) {
    // scheduled handlers run detached from any request — an uncaught throw
    // here just vanishes into Workers logs with no user-facing signal at
    // all, so log loudly instead of letting it fail invisibly
    console.error("recomputeResults failed", err);
  }
}