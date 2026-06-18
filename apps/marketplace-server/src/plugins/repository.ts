import type {
	FindPluginByNameFromServerType,
	ListPluginsResponseFromServerType,
} from "@recall/marketplace-interface";
import type { PluginConfig } from "@recall/plugin-schema";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Context } from "hono";
import { createDb } from "../db/client";
import * as schema from "../db/schema";
import type { Env } from "../env";

type Database = DrizzleD1Database<typeof schema>;

type PluginRow = typeof schema.plugins.$inferSelect;
type PluginVersionRow = typeof schema.pluginVersions.$inferSelect;
type PublisherRow = typeof schema.publishers.$inferSelect;
type AppContext = Context<{ Bindings: Env }>;

type SavePluginVersionArgs = {
	manifest: PluginConfig;
	manifestJson: string;
	r2Key: string;
	size: number;
	publisherUser: {
		id: string;
		name: string;
		email: string;
	};
};

/** Creates a repository for the current Worker request. */
export function createRepo(c: AppContext) {
	return new Repo(createDb(c.env.DB));
}

export class Repo {
	private readonly db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	/** Lists plugins, optionally filtered by a search query. */
	async findManyPlugins(
		filter?: Partial<{ search: string }>,
	): Promise<ListPluginsResponseFromServerType> {
		const search = filter?.search;
		const query = this.db
			.select({
				plugin: schema.plugins,
				publisher: schema.publishers,
			})
			.from(schema.plugins)
			.leftJoin(
				schema.publishers,
				eq(schema.plugins.publisherId, schema.publishers.id),
			);

		const rows = !search
			? await query.orderBy(desc(schema.plugins.updatedAt))
			: await query
					.where(
						or(
							like(schema.plugins.name, `%${search}%`),
							like(schema.plugins.displayName, `%${search}%`),
							like(schema.plugins.description, `%${search}%`),
						),
					)
					.orderBy(desc(schema.plugins.updatedAt));

		return rows.map((row) => toPluginResponse(row.plugin, row.publisher));
	}

	/** Finds one plugin by package name. */
	async findPluginByName(
		name: string,
	): Promise<FindPluginByNameFromServerType | null> {
		const rows = await this.db
			.select({
				plugin: schema.plugins,
				publisher: schema.publishers,
			})
			.from(schema.plugins)
			.leftJoin(
				schema.publishers,
				eq(schema.plugins.publisherId, schema.publishers.id),
			)
			.where(eq(schema.plugins.name, name))
			.limit(1);

		const row = rows[0];
		if (!row) return null;

		return toPluginResponse(row.plugin, row.publisher);
	}

	/** Reads plugin detail for server-rendered marketplace pages. */
	async findPluginDetailByName(name: string): Promise<{
		plugin: PluginRow;
		publisher: PublisherRow | null;
		versions: PluginVersionRow[];
	} | null> {
		const rows = await this.db
			.select({
				plugin: schema.plugins,
				publisher: schema.publishers,
			})
			.from(schema.plugins)
			.leftJoin(
				schema.publishers,
				eq(schema.plugins.publisherId, schema.publishers.id),
			)
			.where(eq(schema.plugins.name, name))
			.limit(1);

		const row = rows[0];
		if (!row) return null;

		const versions = await this.db
			.select()
			.from(schema.pluginVersions)
			.where(eq(schema.pluginVersions.pluginId, row.plugin.id))
			.orderBy(desc(schema.pluginVersions.createdAt));

		return {
			plugin: row.plugin,
			publisher: row.publisher,
			versions,
		};
	}

	/** Finds one plugin database row by package name. */
	private async _findPluginRowByName(name: string): Promise<PluginRow | null> {
		const plugins = await this.db
			.select()
			.from(schema.plugins)
			.where(eq(schema.plugins.name, name))
			.limit(1);

		return plugins[0] ?? null;
	}

	/** Finds a plugin version row with storage metadata. */
	async findPluginVersionRow(args: {
		name: string;
		version: string;
	}): Promise<PluginVersionRow | null> {
		const plugin = await this._findPluginRowByName(args.name);
		if (!plugin) return null;

		const versions = await this.db
			.select()
			.from(schema.pluginVersions)
			.where(
				and(
					eq(schema.pluginVersions.pluginId, plugin.id),
					eq(schema.pluginVersions.version, args.version),
				),
			)
			.limit(1);

		return versions[0] ?? null;
	}

	/** Increments the plugin download counter. */
	async incrementDownloads(name: string) {
		await this.db
			.update(schema.plugins)
			.set({
				totalDownloads: sql`${schema.plugins.totalDownloads} + 1`,
			})
			.where(eq(schema.plugins.name, name));
	}

	/** Saves plugin metadata for an uploaded version. */
	async savePluginVersion(args: SavePluginVersionArgs) {
		const now = new Date().toISOString();
		const existingPlugin = await this._findPluginRowByName(args.manifest.name);
		const publisher = await this.findOrCreatePublisher(args.publisherUser);
		let pluginId = existingPlugin?.id;

		if (pluginId) {
			await this.db
				.update(schema.plugins)
				.set({
					displayName: args.manifest.displayName,
					description: args.manifest.description ?? null,
					author: args.manifest.author,
					homepageUrl: args.manifest.homepage ?? null,
					publisherId: publisher.id,
					latestVersion: args.manifest.version,
					updatedAt: now,
					category: args.manifest.recall.category ?? null,
					iconUrl: args.manifest.recall.iconUrl ?? null,
				})
				.where(eq(schema.plugins.id, pluginId));
		} else {
			const inserted = await this.db
				.insert(schema.plugins)
				.values({
					name: args.manifest.name,
					displayName: args.manifest.displayName,
					description: args.manifest.description ?? null,
					author: args.manifest.author,
					homepageUrl: args.manifest.homepage ?? null,
					publisherId: publisher.id,
					latestVersion: args.manifest.version,
					totalDownloads: 0,
					createdAt: now,
					updatedAt: now,
					category: args.manifest.recall.category ?? null,
					iconUrl: args.manifest.recall.iconUrl ?? null,
				})
				.returning({ id: schema.plugins.id });

			pluginId = inserted[0]?.id;
		}

		if (!pluginId) throw new Error("Failed to save plugin metadata.");

		const existingVersion = await this.findPluginVersionRow({
			name: args.manifest.name,
			version: args.manifest.version,
		});
		if (existingVersion) {
			throw new Error(
				`Version ${args.manifest.version} of plugin "${args.manifest.name}" already exists.`,
			);
		}

		await this.db.insert(schema.pluginVersions).values({
			pluginId,
			version: args.manifest.version,
			size: args.size,
			r2Key: args.r2Key,
			manifest: args.manifestJson,
			manifestVersion: args.manifest.recall.manifestVersion,
			permissions: JSON.stringify(args.manifest.recall.permissions),
			main: args.manifest.recall.main ?? null,
			theme: args.manifest.recall.theme ?? null,
			createdAt: now,
		});
	}

	/** Finds or creates the current user's public publisher profile. */
	async findOrCreatePublisher(user: {
		id: string;
		name: string;
		email: string;
	}): Promise<PublisherRow> {
		const existing = await this.db
			.select()
			.from(schema.publishers)
			.where(eq(schema.publishers.userId, user.id))
			.limit(1);

		if (existing[0]) return existing[0];

		const now = new Date().toISOString();
		const baseUsername = slugUsername(user.name || user.email.split("@")[0]);
		let username = baseUsername;
		let suffix = 1;

		while (await this.findPublisherByUsername(username)) {
			suffix += 1;
			username = `${baseUsername}-${suffix}`;
		}

		const inserted = await this.db
			.insert(schema.publishers)
			.values({
				userId: user.id,
				username,
				isVerified: false,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		const publisher = inserted[0];
		if (!publisher) throw new Error("Failed to create publisher profile.");
		return publisher;
	}

	private async findPublisherByUsername(username: string) {
		const publishers = await this.db
			.select()
			.from(schema.publishers)
			.where(eq(schema.publishers.username, username))
			.limit(1);

		return publishers[0] ?? null;
	}
}

function slugUsername(value: string) {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);

	return slug || `publisher-${crypto.randomUUID().slice(0, 8)}`;
}

function toPluginResponse(
	plugin: PluginRow,
	publisher: PublisherRow | null,
): FindPluginByNameFromServerType {
	return {
		name: plugin.name,
		displayName: plugin.displayName,
		description: plugin.description,
		author: plugin.author,
		homepageUrl: plugin.homepageUrl,
		latestVersion: plugin.latestVersion,
		totalDownloads: plugin.totalDownloads,
		createdAt: plugin.createdAt,
		updatedAt: plugin.updatedAt,
		category: plugin.category,
		iconUrl: plugin.iconUrl,
		publisher: {
			username: publisher?.username ?? "unknown",
			isVerified: publisher?.isVerified ?? false,
		},
	};
}
