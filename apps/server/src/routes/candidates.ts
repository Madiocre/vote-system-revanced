import { Hono } from "hono";

export const candidatesRoute = new Hono<{ Bindings: Env }>();

candidatesRoute.get("/api/candidates", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, description,
              image_src AS imageSrc,
              youtube_link AS youtubeLink,
              facebook_link AS facebookLink
       FROM candidates WHERE election_id = ?`
    ).bind(c.env.ELECTION_ID).all();

    return c.json(results);
  } catch (err) {
    console.error("candidatesRoute failed", err);
    return c.json({ error: "failed_to_load_candidates" }, 500);
  }
});