import { describe, expect, test } from "bun:test";
import type { MarketplaceInfo } from "../contracts";
import { MarketplaceClient } from "./marketplace-client";

const marketplace: MarketplaceInfo = {
	name: "Test Marketplace",
	namespace: "test",
	baseUrl: "https://market.example/api/",
	urls: {
		listPlugins: "plugins?q=<query>",
		getPluginByName: "plugins/<plugin-name>",
		getPluginVersion: "plugins/<plugin-name>/<plugin-version>",
	},
};

const plugin = {
	name: "@recall/example",
	displayName: "Example",
	author: "Recall",
	latestVersion: "1.0.0",
	publisher: {
		username: "recall",
		isVerified: true,
	},
};

describe("MarketplaceClient", () => {
	test("discovers and validates marketplace information", async () => {
		const requests: string[] = [];
		const client = new MarketplaceClient({
			fetch: async (request) => {
				requests.push(String(request));
				return Response.json(marketplace);
			},
		});

		await expect(
			client.getMarketplaceInfo("https://market.example/api/"),
		).resolves.toEqual(marketplace);
		expect(requests).toEqual(["https://market.example/api/"]);
	});

	test("lists plugins, applies defaults, and adds client-side IDs", async () => {
		const requests: string[] = [];
		const client = new MarketplaceClient({
			fetch: async (request) => {
				requests.push(String(request));
				return Response.json([plugin]);
			},
		});

		await expect(
			client.listPlugins(marketplace, { search: "dark themes" }),
		).resolves.toEqual([
			{
				...plugin,
				totalDownloads: 0,
				id: "test:@recall/example",
			},
		]);
		expect(requests).toEqual([
			"https://market.example/api/plugins?q=dark%20themes",
		]);
	});

	test("reads a plugin using its encoded package name", async () => {
		const requests: string[] = [];
		const client = new MarketplaceClient({
			fetch: async (request) => {
				requests.push(String(request));
				return Response.json(plugin);
			},
		});

		await expect(
			client.getPluginByName(marketplace, "@recall/example"),
		).resolves.toMatchObject({
			name: "@recall/example",
			id: "test:@recall/example",
		});
		expect(requests).toEqual([
			"https://market.example/api/plugins/%40recall%2Fexample",
		]);
	});

	test("reads install metadata for a plugin version", async () => {
		const requests: string[] = [];
		const versionResponse = {
			version: "1.0.0",
			size: 42,
			downloadUrl: "https://cdn.example/plugin.zip",
			manifestVersion: "0.0.1",
			permissions: [],
			createdAt: "2026-06-18T00:00:00.000Z",
		};
		const client = new MarketplaceClient({
			fetch: async (request) => {
				requests.push(String(request));
				return Response.json(versionResponse);
			},
		});

		await expect(
			client.getPluginVersion(marketplace, "@recall/example", "1.0.0"),
		).resolves.toEqual(versionResponse);
		expect(requests).toEqual([
			"https://market.example/api/plugins/%40recall%2Fexample/1.0.0",
		]);
	});

	test("builds and splits namespaced plugin IDs", () => {
		const client = new MarketplaceClient();
		const id = client.resolvePluginId(marketplace, "@recall/example");

		expect(id).toBe("test:@recall/example");
		expect(client.splitPluginId(id)).toEqual({
			namespace: "test",
			name: "@recall/example",
		});
	});
});
