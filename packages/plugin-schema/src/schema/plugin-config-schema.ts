import { z } from "zod";
import { PluginPermissionSchema } from "./plugin-permissions";

/**
 * Matches an unscoped plugin name or a scoped package-style plugin name.
 *
 * @example `plugin-name`
 * @example `@username/plugin-name`
 */
export const PLUGIN_NAME_REGEX = /^(?:@[a-zA-Z0-9-]+\/)?[a-zA-Z0-9-]+$/;

/** Matches the supported `Major.Minor.Patch` plugin version format. */
export const PLUGIN_VERSION_REGEX = /^\d+\.\d+\.\d+$/;

export const LATEST_MANIFEST_VERSION = "0.0.1";

/**
 * Manifest versions understood by this release of the schema package.
 */
export const MANIFEST_VERSIONS = [
	{
		deprecated: false,
		name: LATEST_MANIFEST_VERSION,
	},
] as const;

const ACTIVE_MANIFEST_VERSIONS = MANIFEST_VERSIONS.filter(
	(version) => !version.deprecated,
).map((version) => version.name);

/** Manifest versions accepted for newly built plugins. */
export const ManifestVersionSchema = z.enum(ACTIVE_MANIFEST_VERSIONS);

/** Categories currently understood by Recall. */
export const PluginCategorySchema = z.enum(["theme", "others"]);

/**
 * Recall-specific fields stored under the `recall` key in a plugin manifest.
 */
export const RecallPluginConfigSchema = z.object({
	permissions: z
		.array(PluginPermissionSchema)
		.describe("List of permissions the plugin requires to operate"),

	manifestVersion: ManifestVersionSchema.describe(
		"The Recall plugin manifest version this plugin is compatible with",
	),

	category: PluginCategorySchema.optional(),

	iconUrl: z
		.url()
		.optional()
		.describe("URL to an icon representing the plugin"),

	tags: z
		.array(z.string())
		.optional()
		.describe("List of tags for categorizing the plugin"),

	main: z
		.string()
		.optional()
		.describe("Compiled main entry point for the plugin, for example index.js"),

	theme: z
		.string()
		.optional()
		.describe(
			"JSON file containing themes provided by the plugin. When present, the main entry file is currently ignored",
		),
});

/**
 * Plugin manifest stored in the plugin's `package.json` and distributed as
 * `manifest.json`.
 */
export const PluginConfigSchema = z.object({
	name: z
		.string()
		.nonempty()
		.describe("Unique identifier for the plugin")
		.regex(PLUGIN_NAME_REGEX),

	displayName: z.string().nonempty().describe("Display name for the plugin"),

	version: z
		.string()
		.nonempty()
		.regex(PLUGIN_VERSION_REGEX, {
			message: "Must be a valid version like <Major>.<Minor>.<Patch>",
		})
		.describe("Plugin version following the Major.Minor.Patch format"),

	description: z
		.string()
		.optional()
		.describe("Short description of what the plugin does"),

	author: z
		.string()
		.nonempty()
		.describe(
			"Primary author. Formats: 'Name' | 'Name <email>' | 'Name (url)'",
		),

	homepage: z
		.url()
		.optional()
		.describe("Homepage or documentation URL for the plugin"),

	recall: RecallPluginConfigSchema,
});

export type ManifestVersion = z.output<typeof ManifestVersionSchema>;
export type PluginCategory = z.output<typeof PluginCategorySchema>;
export type RecallPluginConfigInput = z.input<typeof RecallPluginConfigSchema>;
export type RecallPluginConfig = z.output<typeof RecallPluginConfigSchema>;
export type PluginConfigInput = z.input<typeof PluginConfigSchema>;
export type PluginConfig = z.output<typeof PluginConfigSchema>;
