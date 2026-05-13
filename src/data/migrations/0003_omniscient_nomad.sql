DROP INDEX `scaffolds_tag_number_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `scaffolds_user_id_tag_number_unique` ON `scaffolds` (`user_id`,`tag_number`);