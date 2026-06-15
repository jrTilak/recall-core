CREATE TABLE `plugin_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plugin_id` integer NOT NULL,
	`version` text NOT NULL,
	`size` integer NOT NULL,
	`r2_key` text NOT NULL,
	`manifest` text NOT NULL,
	`manifest_version` text NOT NULL,
	`main_file` text,
	`theme_file` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`plugin_id`) REFERENCES `plugins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`author` text NOT NULL,
	`latest_version` text NOT NULL,
	`total_downloads` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`category` text,
	`icon_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plugins_name_unique` ON `plugins` (`name`);