import path from "node:path";

export const REPOSITORY_ROOT = path.resolve(import.meta.dir, "../../../..");
export const SCHEMAS_DIR = path.join(REPOSITORY_ROOT, "apps/web", "schemas");

/**
 * Returns the canonical output path for one version of a generated schema.
 *
 * @example `apps/web/schemas/plugin-config/0.0.1.json`
 */
export function getSchemaVersionPath(
	schemaName: string,
	version: string,
): string {
	return path.join(SCHEMAS_DIR, schemaName, `${version}.json`);
}
