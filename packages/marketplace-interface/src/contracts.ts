import { z } from "zod";

export const PLUGIN_NAME_PLACEHOLDER = "<plugin-name>";
export const PLUGIN_VERSION_PLACEHOLDER = "<plugin-version>";
export const QUERY_PLACEHOLDER = "<query>";

/**
 * URL templates exposed by a marketplace.
 *
 * If a URL starts with HTTP or HTTPS, clients use it as-is. Otherwise, clients
 * resolve it against `MarketplaceInfoSchema.baseUrl`.
 *
 * Templates can include placeholders such as `PLUGIN_NAME_PLACEHOLDER`,
 * `PLUGIN_VERSION_PLACEHOLDER`, and `QUERY_PLACEHOLDER`.
 */
export const MarketplaceRouteTemplatesSchema = z.object({
	/**
	 * Lists available plugins.
	 *
	 * Example: `/plugins` or `plugins?q=<query>`.
	 *
	 * TODO: Support pagination, additional filtering, and sorting.
	 */
	listPlugins: z.string(),

	/** Reads a plugin by name. Example: `/plugins/<plugin-name>`. */
	getPluginByName: z.string(),

	/**
	 * Reads version metadata for a plugin.
	 *
	 * Example: `/plugins/<plugin-name>/<plugin-version>`.
	 */
	getPluginVersion: z.string(),
});

/**
 * Marketplace identity and route-discovery document returned by its entry
 * point.
 */
export const MarketplaceInfoSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional().nullable(),
	iconUrl: z.string().optional().nullable(),
	homepageUrl: z.string().optional().nullable(),

	// TODO: Add a marketplace protocol version for compatibility checks when a
	// future release introduces breaking schema changes.

	/**
	 * Namespace used to identify plugins from this marketplace and avoid
	 * conflicts. It should uniquely identify the marketplace.
	 *
	 * @example "dev.jrtilak.recall-default"
	 */
	namespace: z.string().nonempty(),

	/** Base URL used to resolve relative pathname templates from `urls`. */
	baseUrl: z.string().min(1),

	/** Route templates used by clients after marketplace discovery. */
	urls: MarketplaceRouteTemplatesSchema,
});

/** Publisher identity included with every plugin response. */
export const PublisherSchema = z.object({
	username: z.string().min(1),
	isVerified: z.boolean(),
});

/**
 * Plugin metadata returned by both list and detail routes.
 *
 * The server does not include the client-derived plugin `id`.
 */
export const PluginResponseSchema = z.object({
	name: z.string().min(1),
	displayName: z.string().min(1),
	description: z.string().nullable().optional(),
	author: z.string().min(1),
	homepageUrl: z.string().optional().nullable(),
	latestVersion: z.string().min(1),
	totalDownloads: z.number().default(0),
	createdAt: z.string().optional().nullable(),
	updatedAt: z.string().optional().nullable(),
	category: z.string().optional().nullable(),
	iconUrl: z.string().optional().nullable(),
	publisher: PublisherSchema,
});

/** Response returned by the route that lists marketplace plugins. */
export const PluginListResponseSchema = z.array(PluginResponseSchema);

/**
 * Install metadata returned for one plugin version.
 */
export const PluginVersionResponseSchema = z.object({
	version: z.string().min(1),

	/** Zip file size in bytes. */
	size: z.number().int().nonnegative(),

	/**
	 * URL for the zip file containing all extension code.
	 *
	 * This can be a marketplace route, external storage URL, or short-lived
	 * signed URL. Relative URLs resolve against the marketplace `baseUrl`.
	 * Examples: `/plugins/<plugin-name>/<plugin-version>.zip` or
	 * `/plugins/<plugin-name>/<plugin-version>/plugin.zip`.
	 *
	 * @note Until explicit download tracking is available, requests to this URL
	 * can be observed to estimate download counts.
	 */
	downloadUrl: z.string().min(1),

	/** Manifest schema version declared by the plugin. */
	manifestVersion: z.string().min(1),

	/** Permissions requested by the plugin. */
	permissions: z.array(z.string()),

	/** Path to the plugin's compiled main entry file, when present. */
	main: z.string().optional().nullable(),

	/** Path to the plugin's theme file, when present. */
	theme: z.string().optional().nullable(),

	/** Timestamp representing when this plugin version was published. */
	createdAt: z.string(),
});

/**
 * Input types describe values a server may return before Zod applies defaults
 * or other output transformations.
 */
export type MarketplaceRouteTemplatesInput = z.input<
	typeof MarketplaceRouteTemplatesSchema
>;
export type MarketplaceInfoInput = z.input<typeof MarketplaceInfoSchema>;
export type PublisherInput = z.input<typeof PublisherSchema>;
export type PluginResponseInput = z.input<typeof PluginResponseSchema>;
export type PluginListResponseInput = z.input<typeof PluginListResponseSchema>;
export type PluginVersionResponseInput = z.input<
	typeof PluginVersionResponseSchema
>;

/**
 * Output types describe validated values consumed by clients after Zod has
 * applied defaults or other output transformations.
 */
export type MarketplaceRouteTemplates = z.output<
	typeof MarketplaceRouteTemplatesSchema
>;
export type MarketplaceInfo = z.output<typeof MarketplaceInfoSchema>;
export type Publisher = z.output<typeof PublisherSchema>;
export type PluginResponse = z.output<typeof PluginResponseSchema>;
export type PluginListResponse = z.output<typeof PluginListResponseSchema>;
export type PluginVersionResponse = z.output<
	typeof PluginVersionResponseSchema
>;

/**
 * Client-side plugin identity.
 *
 * Derived as `${marketplace.namespace}:${plugin.name}` after validating
 * marketplace list or detail responses.
 */
export type MarketplacePlugin = PluginResponse & { id: string };
