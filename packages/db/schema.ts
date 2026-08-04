// packages/db/schema.ts
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  electionId: text("election_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  imageSrc: text("image_src"),
  youtubeLink: text("youtube_link"),
  facebookLink: text("facebook_link"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id").notNull().references(() => candidates.id),
  electionId: text("election_id").notNull(),
  voterHash: text("voter_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => ({
  oneVotePerVoter: uniqueIndex("one_vote_per_voter").on(t.electionId, t.voterHash),
}));