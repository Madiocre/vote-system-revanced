interface Env {
  DB: D1Database;
  VOTE_GATE: DurableObjectNamespace;
  RESULTS_CACHE: KVNamespace;
  TURNSTILE_SECRET: string;
  VOTER_HASH_SECRET: string;
  ELECTION_ID: string;
}