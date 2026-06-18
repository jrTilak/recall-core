import path from "node:path";
import {
	LATEST_MANIFEST_VERSION,
	PluginConfigSchema,
	ThemeSchema,
} from "@jrtilak-recall/plugin-schema";
import z from "zod";
import { getVersionedSchemaDir } from "../lib/paths";
import { runTasks } from "../lib/run-tasks";
import { writeSchema } from "../lib/write-schema";

const SCHEMA_DIR = getVersionedSchemaDir(LATEST_MANIFEST_VERSION);

async function generatePluginConfigSchema(): Promise<void> {
	const outPath = path.join(SCHEMA_DIR, "plugin-config-schema.json");
	await writeSchema({
		filePath: outPath,
		schema: PluginConfigSchema,
		transform: (jsonSchema) => ({
			allOf: [{ $ref: "https://json.schemastore.org/package.json" }],
			...jsonSchema,
			additionalProperties: true,
		}),
	});
}

async function generateThemeConfigSchema(): Promise<void> {
	const outPath = path.join(SCHEMA_DIR, "theme-config-schema.json");
	await writeSchema({
		filePath: outPath,
		schema: ThemeSchema.extend({ $schema: z.string() }),
	});
}

export async function buildPluginConfigSchemas(): Promise<void> {
	await runTasks([
		{ name: "plugin config schema", run: generatePluginConfigSchema },
		{ name: "theme config schema", run: generateThemeConfigSchema },
	]);
}
