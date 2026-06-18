import type { ZodType, z } from "zod";
import type { MarketplaceFetch } from "./types";

/**
 * Fetches a marketplace endpoint and validates its response using the provided
 * Zod schema.
 */
export async function fetchAndValidate<T extends ZodType>(
	fetch: MarketplaceFetch,
	schema: T,
	url: string,
): Promise<z.output<T>> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request to ${url} failed with status ${response.status}`);
	}

	let data: unknown;
	try {
		const text = await response.text();
		data = text ? JSON.parse(text) : {};
	} catch (error) {
		throw new Error(
			`Invalid JSON response from ${url}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}

	const parsed = schema.safeParse(data);
	if (!parsed.success) {
		throw new Error(
			`Response validation failed for ${url}: ${parsed.error.message}`,
		);
	}

	return parsed.data;
}
