import {
	type PluginPermission,
	PluginPermissionSchema,
} from "@jrtilak-recall/plugin-schema";

const PluginPermissionsSchema = PluginPermissionSchema.array();

/**
 * Parses permissions stored in D1 as JSON.
 *
 * Invalid or legacy values are treated as an empty list instead of breaking an
 * API or rendered page response.
 */
export function parseStoredPermissions(value: unknown): PluginPermission[] {
	if (typeof value !== "string") return [];

	try {
		const result = PluginPermissionsSchema.safeParse(JSON.parse(value));
		return result.success ? result.data : [];
	} catch {
		return [];
	}
}
