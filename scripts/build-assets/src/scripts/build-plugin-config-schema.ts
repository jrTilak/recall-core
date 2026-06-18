import {
	LATEST_MANIFEST_VERSION,
	PluginConfigSchema,
	ThemeSchema,
} from "@jrtilak-recall/plugin-schema";
import z from "zod";
import { getSchemaVersionPath } from "../lib/paths";
import { runTasks } from "../lib/run-tasks";
import { writeSchema } from "../lib/write-schema";

async function generatePluginConfigSchema(): Promise<void> {
	await writeSchema({
		filePath: getSchemaVersionPath("plugin-config", LATEST_MANIFEST_VERSION),
		schema: PluginConfigSchema,
		transform: (jsonSchema) => ({
			allOf: [{ $ref: "https://json.schemastore.org/package.json" }],
			...jsonSchema,
			additionalProperties: true,
		}),
	});
}

async function generateThemeConfigSchema(): Promise<void> {
	await writeSchema({
		filePath: getSchemaVersionPath("theme-config", LATEST_MANIFEST_VERSION),
		schema: ThemeSchema.extend({ $schema: z.string() }),
	});
}

export async function buildPluginConfigSchemas(): Promise<void> {
	await runTasks([
		{ name: "plugin config schema", run: generatePluginConfigSchema },
		{ name: "theme config schema", run: generateThemeConfigSchema },
	]);
}
