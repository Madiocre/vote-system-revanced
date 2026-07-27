// apps/server/src/durable-objects/vote-gate.ts
export class VoteGate {
  constructor(private state: DurableObjectState) {}

  async fetch(req: Request): Promise<Response> {
    const alreadyVoted = await this.state.storage.get<boolean>("voted");
    if (alreadyVoted) {
      return new Response(null, { status: 409 });
    }
    await this.state.storage.put("voted", true);
    return new Response(null, { status: 200 });
  }
}