import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { fetchAndValidate } from "./request";

const ResponseSchema = z.object({
	name: z.string(),
});

describe("fetchAndValidate", () => {
	test("returns validated response data", async () => {
		const result = await fetchAndValidate(
			async () => Response.json({ name: "Recall" }),
			ResponseSchema,
			"https://market.example/api/",
		);

		expect(result).toEqual({ name: "Recall" });
	});

	test("reports unsuccessful HTTP responses", async () => {
		await expect(
			fetchAndValidate(
				async () => new Response("Not found", { status: 404 }),
				ResponseSchema,
				"https://market.example/missing",
			),
		).rejects.toThrow(
			"Request to https://market.example/missing failed with status 404",
		);
	});

	test("reports invalid JSON responses", async () => {
		await expect(
			fetchAndValidate(
				async () =>
					new Response("{invalid", {
						headers: { "content-type": "application/json" },
					}),
				ResponseSchema,
				"https://market.example/api/",
			),
		).rejects.toThrow("Invalid JSON response");
	});

	test("reports schema validation failures", async () => {
		await expect(
			fetchAndValidate(
				async () => Response.json({ name: 42 }),
				ResponseSchema,
				"https://market.example/api/",
			),
		).rejects.toThrow("Response validation failed");
	});
});
