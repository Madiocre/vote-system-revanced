export class VoteGate {
  constructor(private state: DurableObjectState) {}
  // Durable Fetch object to make sure user doesnt keep spamming to try n vote
  async fetch(req: Request): Promise<Response> {
    const alreadyVoted = await this.state.storage.get<boolean>("voted");
    if (alreadyVoted) {
      return new Response(null, { status: 409 });
    }
    await this.state.storage.put("voted", true);
    return new Response(null, { status: 200 });
  }
}