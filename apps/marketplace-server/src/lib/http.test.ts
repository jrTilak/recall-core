import { describe, expect, test } from "bun:test";
import { absoluteUrl, json } from "./http";

describe("absoluteUrl", () => {
	test("replaces the pathname and clears request query state", () => {
		expect(
			absoluteUrl(
				"https://market.example/plugins?q=theme#results",
				"/api/plugins",
			),
		).toBe("https://market.example/api/plugins");
	});
});

describe("json", () => {
	test("returns JSON with the requested status", async () => {
		const response = json({ ok: true }, 201);
		const body = (await response.json()) as { ok: boolean };

		expect(response.status).toBe(201);
		expect(body.ok).toBe(true);
	});
});
