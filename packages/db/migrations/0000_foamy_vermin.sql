CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`election_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_src` text,
	`youtube_link` text,
	`facebook_link` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`election_id` text NOT NULL,
	`voter_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_vote_per_voter` ON `votes` (`election_id`,`voter_hash`);