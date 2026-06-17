import { mkdir } from "node:fs/promises";
import path from "node:path";
import { log } from "@jrtilak-recall/logger";
import {
	LATEST_MANIFEST_VERSION,
	PluginConfigSchema,
	ThemeSchema,
} from "@jrtilak-recall/plugin-schema";
import z from "zod";

const SCHEMA_DIR = path.resolve(
	import.meta.dir,
	"../../../../public/schema",
	`v${LATEST_MANIFEST_VERSION}`,
);

async function ensureDir(dir: string): Promise<void> {
	await mkdir(dir, { recursive: true });
}

async function writeSchema(filePath: string, schema: object): Promise<void> {
	if (Object.keys(schema).length === 0) {
		throw new Error(`Refusing to write empty schema to ${filePath}`);
	}

	let content: string;
	try {
		content = JSON.stringify(schema, null, 2);
	} catch (err) {
		throw new Error(
			`Failed to serialize schema for ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
		);
	}

	await ensureDir(path.dirname(filePath));

	const bytesWritten = await Bun.write(filePath, content);
	if (bytesWritten === 0) {
		throw new Error(
			`Zero bytes written to ${filePath} — write may have silently failed`,
		);
	}
}

async function generatePluginConfigSchema(): Promise<void> {
	log.info("Generating plugin config schema...");

	const jsonSchema = z.toJSONSchema(PluginConfigSchema);
	const extended = {
		allOf: [{ $ref: "https://json.schemastore.org/package.json" }],
		...jsonSchema,
		additionalProperties: true,
	};

	const outPath = path.join(SCHEMA_DIR, "plugin-config-schema.json");
	await writeSchema(outPath, extended);
	log.info(`Plugin config schema written → ${outPath}`);
}

async function generateThemeConfigSchema(): Promise<void> {
	log.info("Generating theme config schema...");

	const themeConfigSchema = z.toJSONSchema(
		ThemeSchema.extend({ $schema: z.string() }),
	);

	const outPath = path.join(SCHEMA_DIR, "theme-config-schema.json");
	await writeSchema(outPath, themeConfigSchema);
	log.info(`Theme config schema written → ${outPath}`);
}

async function main(): Promise<void> {
	log.info(
		`Generating JSON Schemas for manifest v${LATEST_MANIFEST_VERSION}...`,
	);
	log.info(`Output directory: ${SCHEMA_DIR}`);

	const start = performance.now();

	const tasks = [
		{ name: "plugin-config", fn: generatePluginConfigSchema },
		{ name: "theme-config", fn: generateThemeConfigSchema },
	] as const;

	const results = await Promise.allSettled(tasks.map(({ fn }) => fn()));

	let failed = false;
	for (const [i, result] of results.entries()) {
		if (result.status === "rejected") {
			const err = result.reason;
			log.error(
				`Failed to generate "${tasks[i]!.name}" schema: ${
					err instanceof Error ? err.message : String(err)
				}`,
			);
			if (err instanceof Error && err.stack) {
				log.debug(err.stack);
			}
			failed = true;
		}
	}

	const elapsed = (performance.now() - start).toFixed(1);

	if (failed) {
		log.error(`Schema generation finished with errors after ${elapsed}ms.`);
		process.exit(1);
	}

	log.info(`All schemas generated successfully in ${elapsed}ms.`);
}

main().catch((err) => {
	log.error(
		`Unexpected fatal error: ${err instanceof Error ? err.message : String(err)}`,
	);
	if (err instanceof Error && err.stack) {
		log.debug(err.stack);
	}
	process.exit(1);
});
