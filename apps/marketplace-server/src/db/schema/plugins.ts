import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const publishers = sqliteTable("publishers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }),
	username: text("username").notNull().unique(),
	isVerified: integer("is_verified", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const plugins = sqliteTable("plugins", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull().unique(),
	displayName: text("display_name").notNull(),
	description: text("description"),
	author: text("author").notNull(),
	homepageUrl: text("homepage_url"),
	publisherId: integer("publisher_id").references(() => publishers.id, {
		onDelete: "set null",
	}),
	latestVersion: text("latest_version").notNull(),
	totalDownloads: integer("total_downloads").notNull().default(0),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
	category: text("category"),
	iconUrl: text("icon_url"),
});

export const pluginVersions = sqliteTable("plugin_versions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	pluginId: integer("plugin_id")
		.references(() => plugins.id, { onDelete: "cascade" })
		.notNull(),
	version: text("version").notNull(),
	size: integer("size").notNull(),
	r2Key: text("r2_key").notNull(),
	manifest: text("manifest").notNull(),
	manifestVersion: text("manifest_version").notNull(),
	permissions: text("permissions").notNull().default("[]"),
	main: text("main_file"),
	theme: text("theme_file"),
	createdAt: text("created_at").notNull(),
});
