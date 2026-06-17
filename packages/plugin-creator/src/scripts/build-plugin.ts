#!/usr/bin/env bun

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { PluginConfigSchema, ThemeSchema } from "@jrtilak-recall/plugin-schema";
import z from "zod";

const __DIST_THEME_PATH = "theme.json";

const root = process.cwd();
const distDir = join(root, "dist");

console.log(`Building plugin from dir ${root} ...`);

console.log("Cleaning dist directory...");

await rm(distDir, { recursive: true, force: true });

const pkg = await Bun.file(join(root, "package.json")).json();

if (!pkg) {
	console.error("No package.json found in plugin root");
	process.exit(1);
}

const result = PluginConfigSchema.safeParse(pkg);

if (!result.success) {
	console.error(
		"Invalid plugin config: package.json does not conform to PluginConfigSchema",
	);
	console.error(z.treeifyError(result.error));
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

console.log("Plugin manifest generated");

const theme = pkgJson.recall.theme;

if (theme) {
	console.log("Plugin has theme, copying theme files...");
	const themeJson = await Bun.file(join(root, theme)).json();

	if (!themeJson) {
		console.error(`Theme file ${theme} not found or invalid JSON`);
		process.exit(1);
	}

	const result = ThemeSchema.safeParse(themeJson);

	if (!result.success) {
		console.error(
			"Invalid plugin theme: theme file does not conform to ThemeSchema",
		);
		console.error(z.treeifyError(result.error));
		process.exit(1);
	}

	Bun.write(join(distDir, __DIST_THEME_PATH), JSON.stringify(result.data));
	console.log("Plugin theme generated");
}

const main = pkgJson.recall.main;

// TODO: support main file
if (main) {
}

if (!main && !theme) {
	console.error("Plugin must have either a main file or a theme");
	process.exit(1);
}

console.log("Plugin build complete");

// TODO: also zip the plguin using `zip` if available
