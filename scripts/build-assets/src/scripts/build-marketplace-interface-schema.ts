import path from "node:path";
import {
	FindPluginByNameSchema,
	ListPluginsResponseSchema,
	MarketplaceInfoSchema,
	PluginVersionSchema,
} from "@jrtilak-recall/marketplace-interface";
import marketplacePackage from "../../../../packages/marketplace-interface/package.json";
import { getPackageSchemaDir } from "../lib/paths";
import { runTasks } from "../lib/run-tasks";
import { writeSchema } from "../lib/write-schema";

const SCHEMA_DIR = getPackageSchemaDir(
	"marketplace-interface",
	marketplacePackage.version,
);

export async function buildMarketplaceInterfaceSchemas(): Promise<void> {
	await runTasks([
		{
			name: "marketplace info response schema",
			run: () =>
				writeSchema({
					filePath: path.join(
						SCHEMA_DIR,
						"marketplace-info-response-schema.json",
					),
					schema: MarketplaceInfoSchema,
				}),
		},
		{
			name: "plugin list response schema",
			run: () =>
				writeSchema({
					filePath: path.join(SCHEMA_DIR, "list-plugins-response-schema.json"),
					schema: ListPluginsResponseSchema,
				}),
		},
		{
			name: "plugin detail response schema",
			run: () =>
				writeSchema({
					filePath: path.join(SCHEMA_DIR, "plugin-response-schema.json"),
					schema: FindPluginByNameSchema,
				}),
		},
		{
			name: "plugin version response schema",
			run: () =>
				writeSchema({
					filePath: path.join(
						SCHEMA_DIR,
						"plugin-version-response-schema.json",
					),
					schema: PluginVersionSchema,
				}),
		},
	]);
}
