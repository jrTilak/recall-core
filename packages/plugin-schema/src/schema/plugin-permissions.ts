import { z } from "zod";

/**
 * Permissions a plugin may request from Recall.
 */
export const PluginPermissionSchema = z.enum([
	/**
	 * Changes the color theme and other UI variables statically through
	 * configuration. This permission is sufficient for theme-only plugins.
	 */
	"ui.theme.static.write",
]);

export type PluginPermission = z.infer<typeof PluginPermissionSchema>;
