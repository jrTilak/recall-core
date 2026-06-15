import { z } from "zod";

export const PLUGIN_NAME_PLACEHOLDER = "<plugin-name>";
export const PLUGIN_VERSION_PLACEHOLDER = "<plugin-version>";
export const QUERY_PLACEHOLDER = "<query>";

/**
 * URL templates exposed by a marketplace.
 *
 * If a URL starts with http/https, clients will use it as-is. Otherwise,
 * clients should resolve it against `MarketplaceInfoSchema.baseUrl`.
 *
 * Templates can include placeholders such as `PLUGIN_NAME_PLACEHOLDER`,
 * `PLUGIN_VERSION_PLACEHOLDER`, and `QUERY_PLACEHOLDER`.
 */
export const MarketplaceUrlsSchema = z.object({
	/**
	 * Lists available plugins. Example: `/plugins` or `plugin?q=<query>`.
	 *  TODO: Support pagination, filtering, and sorting etc
	 * */
	listPlugins: z.string(),

	/** Reads a plugin by name. Example: `/plugins/<plugin-name>`. */
	getPluginByName: z.string(),

	/**
	 * Reads version metadata for a plugin.
	 * Example: `/plugins/<plugin-name>/<plugin-version>`.
	 */
	getPluginVersion: z.string(),
});

export const MarketplaceInfoSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional().nullable(),
	iconUrl: z.string().optional().nullable(),
	homepageUrl: z.string().optional().nullable(),

	/**
	 * Namespace used to identify plugins from this marketplace to avoid conflict.
	 * Make sure it uniquely identifies your marketplace,
	 * @example "dev.jrtilak.recall-default".
	 * */
	namespace: z.string().nonempty(),

	/**
	 * Base URL used to resolve pathname URL templates from `urls`.
	 * */
	baseUrl: z.string().min(1),
	urls: MarketplaceUrlsSchema,
});

export type MarketplaceInfoType = z.infer<typeof MarketplaceInfoSchema>;

export const PluginBaseSchema = z.object({
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

	publisher: z.object({
		username: z.string().min(1),
		isVerified: z.boolean(),
	}),
});
export type PluginBaseType = z.infer<typeof PluginBaseSchema>;

/**
 * Client-side plugin identity.
 *
 * Derived as `${marketplace.namespace}:${plugin.name}` after validating
 * marketplace list/detail responses.
 */
export type PluginType = PluginBaseType & { id: string };

export const ListPluginsResponseSchema = z.array(PluginBaseSchema);
export type ListPluginsResponseType = PluginType[];
export type ListPluginsResponseFromServerType = z.infer<
	typeof ListPluginsResponseSchema
>;

export const FindPluginByNameSchema = PluginBaseSchema;
export type FindPluginByNameType = PluginType;
export type FindPluginByNameFromServerType = z.infer<
	typeof FindPluginByNameSchema
>;

export const PluginVersionSchema = z.object({
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
	 * @note: Since for now there is not tracking of download count, you can watch this url to determine the approximate number of downloads.
	 */
	downloadUrl: z.string().min(1),

	/** Manifest schema version declared by the plugin. */
	manifestVersion: z.string().min(1),

	/** Permissions requested by the plugin. */
	permissions: z.array(z.string()),

	/**
	 *  Path to main, theme file
	 * */
	main: z.string().optional().nullable(),
	theme: z.string().optional().nullable(),

	createdAt: z.string(),
});
export type PluginVersionType = z.infer<typeof PluginVersionSchema>;
