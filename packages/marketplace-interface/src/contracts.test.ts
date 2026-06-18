import { describe, expect, test } from "bun:test";
import {
	MarketplaceInfoSchema,
	type PluginResponseInput,
	PluginResponseSchema,
	PluginVersionResponseSchema,
} from "./contracts";

describe("marketplace contracts", () => {
	test("accepts a marketplace discovery document", () => {
		expect(
			MarketplaceInfoSchema.parse({
				name: "Test Marketplace",
				namespace: "test",
				baseUrl: "https://market.example/api/",
				urls: {
					listPlugins: "plugins?q=<query>",
					getPluginByName: "plugins/<plugin-name>",
					getPluginVersion: "plugins/<plugin-name>/<plugin-version>",
				},
			}),
		).toBeDefined();
	});

	test("requires every marketplace route template", () => {
		const result = MarketplaceInfoSchema.safeParse({
			name: "Test Marketplace",
			namespace: "test",
			baseUrl: "https://market.example/api/",
			urls: {
				listPlugins: "plugins",
			},
		});

		expect(result.success).toBe(false);
	});

	test("lets servers omit fields that receive schema defaults", () => {
		const response: PluginResponseInput = {
			name: "@recall/example",
			displayName: "Example",
			author: "Recall",
			latestVersion: "1.0.0",
			publisher: {
				username: "recall",
				isVerified: true,
			},
		};

		expect(PluginResponseSchema.parse(response).totalDownloads).toBe(0);
	});

	test("accepts nullable optional plugin metadata", () => {
		const result = PluginResponseSchema.parse({
			name: "@recall/example",
			displayName: "Example",
			description: null,
			author: "Recall",
			homepageUrl: null,
			latestVersion: "1.0.0",
			iconUrl: null,
			publisher: {
				username: "recall",
				isVerified: false,
			},
		});

		expect(result.description).toBeNull();
		expect(result.iconUrl).toBeNull();
	});

	test("rejects invalid plugin version metadata", () => {
		expect(() =>
			PluginVersionResponseSchema.parse({
				version: "1.0.0",
				size: -1,
				downloadUrl: "https://cdn.example/plugin.zip",
				manifestVersion: "0.0.1",
				permissions: [],
				createdAt: "2026-06-18T00:00:00.000Z",
			}),
		).toThrow();
	});
});
