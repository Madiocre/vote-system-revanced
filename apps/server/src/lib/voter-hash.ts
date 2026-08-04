export async function hashVoterIdentity(ip: string, secret: string): Promise<string> {
  // TODO: is IP alone enough, or do you fold in anything else here?
  // Whatever goes in, it needs to be something the DO/D1 can key on
  // consistently for the SAME voter across requests, and NOT something
  // that changes per-request (e.g. don't include a timestamp or the
  // Turnstile token itself, or every request looks like a new voter).
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}