import { describe, expect, test } from "bun:test";
import { MarketplaceInfoSchema } from "@jrtilak-recall/marketplace-interface/server";
import type { Env } from "../env";
import { apiRoute } from "./api";

describe("marketplace API", () => {
	test("returns a valid marketplace discovery document", async () => {
		const env: Env = {
			DB: {} as D1Database,
			PLUGIN_BUCKET: {} as R2Bucket,
			MARKETPLACE_NAME: "Default Marketplace",
			MARKETPLACE_DESCRIPTION: "Official marketplace for Recall plugins.",
			MARKETPLACE_NAMESPACE: "default",
			MAX_PLUGIN_ZIP_BYTES: "10485760",
		};

		const response = await apiRoute.request(
			"http://market.example/",
			undefined,
			env,
		);
		const body = await response.json();
		const result = MarketplaceInfoSchema.safeParse(body);

		expect(response.status).toBe(200);
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data).toMatchObject({
			name: "Default Marketplace",
			namespace: "default",
			baseUrl: "http://market.example/api/",
		});
	});
});
