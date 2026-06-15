#!/usr/bin/env bun

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "@recall/logger";
import { PluginConfigSchema, ThemeSchema } from "@recall/plugin-schema";
import z from "zod";

const __DIST_THEME_PATH = "theme.json";

const root = process.cwd();
const distDir = join(root, "dist");

logger.info(`Building plugin from dir ${root} ...`);

logger.info("Cleaning dist directory...");

await rm(distDir, { recursive: true, force: true });

const pkg = await Bun.file(join(root, "package.json")).json();

if (!pkg) {
	logger.error("No package.json found in plugin root");
	process.exit(1);
}

const result = PluginConfigSchema.safeParse(pkg);

if (!result.success) {
	logger.error(
		"Invalid plugin config: package.json does not conform to PluginConfigSchema",
	);
	logger.error(z.treeifyError(result.error));
	process.exit(1);
}

const pkgJson = result.data;

const newManifst = {
	...pkgJson,
	recall: {
		...pkgJson.recall,
		theme: __DIST_THEME_PATH,
	},
};

await Bun.write(join(distDir, "manifest.json"), JSON.stringify(newManifst));

logger.info("Plugin manifest generated");

const theme = pkgJson.recall.theme;

if (theme) {
	logger.info("Plugin has theme, copying theme files...");
	const themeJson = await Bun.file(join(root, theme)).json();

	if (!themeJson) {
		logger.error(`Theme file ${theme} not found or invalid JSON`);
		process.exit(1);
	}

	const result = ThemeSchema.safeParse(themeJson);

	if (!result.success) {
		logger.error(
			"Invalid plugin theme: theme file does not conform to ThemeSchema",
		);
		logger.error(z.treeifyError(result.error));
		process.exit(1);
	}

	Bun.write(join(distDir, __DIST_THEME_PATH), JSON.stringify(result.data));
	logger.info("Plugin theme generated");
}

const main = pkgJson.recall.main;

// TODO: support main file
if (main) {
}

if (!main && !theme) {
	logger.error("Plugin must have either a main file or a theme");
	process.exit(1);
}

logger.info("Plugin build complete");

// TODO: also zip the plguin using `zip` if available
