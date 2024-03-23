ALTER TABLE user ADD `email` text(100);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);