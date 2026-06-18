import { runTasks } from "./lib/run-tasks";
import { buildMarketplaceInterfaceSchemas } from "./scripts/build-marketplace-interface-schema";
import { buildPluginConfigSchemas } from "./scripts/build-plugin-config-schema";

async function main(): Promise<void> {
	const start = performance.now();

	await runTasks([
		{
			name: "plugin configuration schemas",
			run: buildPluginConfigSchemas,
		},
		{
			name: "marketplace interface schemas",
			run: buildMarketplaceInterfaceSchemas,
		},
	]);

	console.log(
		`All assets built successfully in ${(performance.now() - start).toFixed(1)}ms`,
	);
}

main().catch((error) => {
	console.error(
		`Asset build failed: ${
			error instanceof Error ? error.message : String(error)
		}`,
	);
	process.exitCode = 1;
});
