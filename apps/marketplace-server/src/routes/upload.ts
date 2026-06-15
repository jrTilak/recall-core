import { PluginConfigSchema } from "@recall/plugin-schema";
import { unzipSync } from "fflate";
import { Hono } from "hono";
import { requireSession } from "../auth/server";
import type { Env } from "../env";
import { json } from "../lib/http";
import { createRepo } from "../plugins/repository";

const DEFAULT_MAX_PLUGIN_ZIP_BYTES = 10 * 1024 * 1024;

type AppEnv = { Bindings: Env };

export const uploadRoute = new Hono<AppEnv>({ strict: false });

uploadRoute.post("/plugins", async (c) => {
	let uploadedR2Key: string | undefined;

	try {
		const session = await requireSession(c);
		if (!session) {
			if (acceptsHtml(c.req.raw)) {
				return c.redirect(`/login?next=${encodeURIComponent("/upload")}`);
			}
			return json({ error: "Log in before uploading plugins." }, 401);
		}

		const zipFile = await readPluginZip(c.req.raw);
		const maxBytes = Number(
			c.env.MAX_PLUGIN_ZIP_BYTES ?? DEFAULT_MAX_PLUGIN_ZIP_BYTES,
		);

		if (zipFile.size <= 0) {
			return json({ error: "Upload a non-empty plugin zip file." }, 400);
		}
		if (zipFile.size > maxBytes) {
			return json(
				{ error: `Plugin zip must be ${maxBytes} bytes or smaller.` },
				413,
			);
		}

		const zipBytes = new Uint8Array(await zipFile.arrayBuffer());
		const files = unzipSync(zipBytes);
		const fileNames = Object.keys(files).filter((name) => !name.endsWith("/"));

		validateZipPaths(fileNames);
		if (!files["manifest.json"]) {
			return json(
				{ error: "Plugin zip must contain manifest.json at its root." },
				400,
			);
		}

		const manifestJson = new TextDecoder().decode(files["manifest.json"]);
		const parsedManifest = PluginConfigSchema.safeParse(
			JSON.parse(manifestJson),
		);
		if (!parsedManifest.success) {
			return json(
				{
					error: "manifest.json does not match the Recall plugin schema.",
					details: parsedManifest.error.issues,
				},
				400,
			);
		}

		const manifest = parsedManifest.data;
		validateDeclaredFiles(
			fileNames,
			manifest.recall.main,
			manifest.recall.theme,
		);

		const repo = createRepo(c);
		const existingVersion = await repo.findPluginVersionRow({
			name: manifest.name,
			version: manifest.version,
		});
		if (existingVersion) {
			return json(
				{
					error: `Version ${manifest.version} of plugin "${manifest.name}" already exists.`,
				},
				409,
			);
		}

		const r2Key = `plugins/${manifest.name}/${manifest.version}/plugin.zip`;
		await c.env.PLUGIN_BUCKET.put(r2Key, zipBytes, {
			httpMetadata: { contentType: "application/zip" },
		});
		uploadedR2Key = r2Key;

		await repo.savePluginVersion({
			manifest,
			manifestJson,
			r2Key,
			size: zipFile.size,
			publisherUser: {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
			},
		});

		if (acceptsHtml(c.req.raw)) {
			return c.redirect(`/plugins/${encodeURIComponent(manifest.name)}`);
		}

		return json(
			{
				name: manifest.name,
				version: manifest.version,
				size: zipFile.size,
				r2Key,
			},
			201,
		);
	} catch (error) {
		if (uploadedR2Key) await c.env.PLUGIN_BUCKET.delete(uploadedR2Key);

		return json(
			{
				error: error instanceof Error ? error.message : "Plugin upload failed.",
			},
			400,
		);
	}
});

function acceptsHtml(request: Request) {
	return request.headers.get("accept")?.includes("text/html") ?? false;
}

/** Reads the uploaded plugin zip from a multipart request. */
async function readPluginZip(request: Request) {
	const form = await request.formData();
	const plugin = form.get("plugin") ?? form.get("zip") ?? form.get("file");

	if (!isUploadedFile(plugin)) {
		throw new Error("Upload a plugin zip file using the `plugin` form field.");
	}
	if (!plugin.name.endsWith(".zip")) {
		throw new Error("Only .zip plugin uploads are supported.");
	}

	return plugin;
}

/** Checks for a Worker-compatible uploaded file object. */
function isUploadedFile(value: unknown): value is File {
	return (
		typeof value === "object" &&
		value !== null &&
		"name" in value &&
		"size" in value &&
		"arrayBuffer" in value
	);
}

/** Rejects unsafe paths and zips wrapped by a single top-level folder. */
function validateZipPaths(fileNames: string[]) {
	if (fileNames.length === 0) throw new Error("Plugin zip is empty.");

	for (const name of fileNames) {
		if (name.startsWith("/") || name.includes("\\") || name.includes("..")) {
			throw new Error(`Unsafe zip path: ${name}`);
		}
	}

	const rootFiles = fileNames.filter((name) => !name.includes("/"));
	if (rootFiles.length === 0) {
		throw new Error("Plugin zip files must be at the archive root.");
	}
}

/** Checks that manifest-declared files exist in the uploaded zip. */
function validateDeclaredFiles(
	fileNames: string[],
	main?: string,
	theme?: string,
) {
	if (main && !fileNames.includes(main)) {
		throw new Error(`Main file "${main}" was not found in the plugin zip.`);
	}
	if (theme && !fileNames.includes(theme)) {
		throw new Error(`Theme file "${theme}" was not found in the plugin zip.`);
	}
}
