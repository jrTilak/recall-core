import {
	type MarketplaceInfoInput,
	PLUGIN_NAME_PLACEHOLDER,
	PLUGIN_VERSION_PLACEHOLDER,
	type PluginListResponseInput,
	type PluginResponseInput,
	type PluginVersionResponseInput,
	QUERY_PLACEHOLDER,
} from "@jrtilak-recall/marketplace-interface/server";
import { Hono } from "hono";
import type { Env } from "../env";
import { absoluteUrl, json } from "../lib/http";
import { parseStoredPermissions } from "../plugins/permissions";
import { createRepo } from "../plugins/repository";

type AppEnv = { Bindings: Env };

export const apiRoute = new Hono<AppEnv>({ strict: false });

apiRoute.get("/", (c) => {
	const apiBaseUrl = absoluteUrl(c.req.url, "/api/");

	const info: MarketplaceInfoInput = {
		name: c.env.MARKETPLACE_NAME ?? "Recall Plugin Registry",
		description:
			c.env.MARKETPLACE_DESCRIPTION ??
			"Cloudflare-hosted registry for Recall plugins.",
		baseUrl: apiBaseUrl,
		namespace: c.env.MARKETPLACE_NAMESPACE ?? "default",
		urls: {
			listPlugins: `plugins?q=${QUERY_PLACEHOLDER}`,
			getPluginByName: `plugins/${PLUGIN_NAME_PLACEHOLDER}`,
			getPluginVersion: `plugins/${PLUGIN_NAME_PLACEHOLDER}/${PLUGIN_VERSION_PLACEHOLDER}`,
		},
	};

	return json(info);
});

apiRoute.get("/plugins", async (c) => {
	const plugins: PluginListResponseInput = await createRepo(c).findManyPlugins({
		search: c.req.query("q"),
	});
	return json(plugins);
});

apiRoute.get("/plugins/:name", async (c) => {
	const plugin: PluginResponseInput | null = await createRepo(
		c,
	).findPluginByName(decodeURIComponent(c.req.param("name")));

	if (!plugin) return json({ error: "Plugin not found" }, 404);
	return json(plugin);
});

apiRoute.get("/plugins/:name/:version", async (c) => {
	const name = decodeURIComponent(c.req.param("name"));
	const version = decodeURIComponent(c.req.param("version"));
	const repository = createRepo(c);
	const versionRow = await repository.findPluginVersionRow({ name, version });

	if (!versionRow) return json({ error: "Plugin version not found" }, 404);

	const pluginVersion: PluginVersionResponseInput = {
		version: versionRow.version,
		size: versionRow.size,
		downloadUrl: absoluteUrl(
			c.req.url,
			`/api/plugins/${encodeURIComponent(name)}/${encodeURIComponent(
				version,
			)}/plugin.zip`,
		),
		manifestVersion: versionRow.manifestVersion,
		permissions: parseStoredPermissions(versionRow.permissions),
		main: versionRow.main,
		theme: versionRow.theme,
		createdAt: versionRow.createdAt,
	};
	return json(pluginVersion);
});

apiRoute.get("/plugins/:name/:version/plugin.zip", async (c) => {
	const name = decodeURIComponent(c.req.param("name"));
	const version = decodeURIComponent(c.req.param("version"));
	const repository = createRepo(c);
	const versionRow = await repository.findPluginVersionRow({
		name,
		version,
	});

	if (!versionRow) return json({ error: "Plugin version not found" }, 404);

	const object = await c.env.PLUGIN_BUCKET.get(versionRow.r2Key);
	if (!object) return json({ error: "Plugin archive not found" }, 404);

	await repository.incrementDownloads(name);

	return new Response(object.body, {
		headers: {
			"content-type": "application/zip",
			"content-length": String(object.size),
			etag: object.httpEtag,
		},
	});
});
