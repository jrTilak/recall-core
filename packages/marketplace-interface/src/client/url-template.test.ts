import { describe, expect, test } from "bun:test";
import type { MarketplaceInfo } from "../contracts";
import { resolveTemplateUrl } from "./url-template";

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

describe("resolveTemplateUrl", () => {
	test("resolves relative routes against the marketplace base URL", () => {
		expect(resolveTemplateUrl("plugins", marketplace)).toBe(
			"https://market.example/api/plugins",
		);
	});

	test("preserves absolute route templates", () => {
		expect(resolveTemplateUrl("https://cdn.example/plugins", marketplace)).toBe(
			"https://cdn.example/plugins",
		);
	});

	test("encodes placeholder values", () => {
		expect(
			resolveTemplateUrl("plugins/<plugin-name>", marketplace, {
				"<plugin-name>": "@recall/default theme",
			}),
		).toBe("https://market.example/api/plugins/%40recall%2Fdefault%20theme");
	});

	test("supports URL-encoded placeholders in templates", () => {
		expect(
			resolveTemplateUrl("plugins/%3Cplugin-name%3E", marketplace, {
				"<plugin-name>": "@recall/example",
			}),
		).toBe("https://market.example/api/plugins/%40recall%2Fexample");
	});

	test("removes an unresolved optional query placeholder", () => {
		expect(resolveTemplateUrl("plugins?q=<query>", marketplace)).toBe(
			"https://market.example/api/plugins?q=",
		);
	});
});
