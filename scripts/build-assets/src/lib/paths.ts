import path from "node:path";

export const REPOSITORY_ROOT = path.resolve(import.meta.dir, "../../../..");
export const PUBLIC_SCHEMA_DIR = path.join(REPOSITORY_ROOT, "public/schema");

export function getVersionedSchemaDir(version: string): string {
	return path.join(PUBLIC_SCHEMA_DIR, `v${version}`);
}

export function getPackageSchemaDir(
	packageName: string,
	version: string,
): string {
	return path.join(PUBLIC_SCHEMA_DIR, packageName, `v${version}`);
}
