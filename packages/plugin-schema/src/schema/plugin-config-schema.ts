import z from "zod";
import { Permissions } from "./plugin-permissions";

/**
 *  @example `plugin-name` or @username/plugin-name
 * */
export const PLUGIN_NAME_REGEX = /^(?:@[a-zA-Z0-9-]+\/)?[a-zA-Z0-9-]+$/;

export const LATEST_MANIFEST_VERSION = "0.0.1";
export const AVAILABLE_MANIFEST_VERSIONS = [
	{
		deprecated: false,
		name: LATEST_MANIFEST_VERSION,
	},
] as const;

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
		.refine((v) => /^\d+\.\d+\.\d+$/.test(v), {
			message: "Must be a valid version like <Major>.<Minor>.<Patch>",
		})
		.describe(
			"Version of the plugin following semantic versioning ie Major.Minor.Patch",
		),

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

	/**
	 *  Recall Specific fields
	 * */
	recall: z.object({
		permissions: z
			.array(Permissions)
			.describe("List of permissions the plugin requires to operate"),

		manifestVersion: z
			.enum(
				AVAILABLE_MANIFEST_VERSIONS.filter((v) => !v.deprecated).map(
					(v) => v.name,
				),
			)
			.describe("The manifest for plugin which it is compatible with"),

		category: z.enum(["theme", "others"]).optional(),

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
			.describe(
				"Main entry point for the plugin eg index.js (after the build)",
			),

		theme: z
			.string()
			.optional()
			.describe(
				"A json file containing theme provided by the plugin (if any), If a file contains theme file, main entry file will be ignored",
			),
	}),
});

export type PluginConfigSchemaType = z.infer<typeof PluginConfigSchema>;
