import type { MarketplaceInfo } from "../contracts";

type TemplateValues = Record<string, string | undefined>;

/** Ensures a URL ends with a slash. */
function normalizeBaseUrl(url: string): string {
	return url.endsWith("/") ? url : `${url}/`;
}

/**
 * Resolves a marketplace URL.
 *
 * Absolute HTTP URLs are returned as-is. Relative URLs are resolved against
 * the provided marketplace base URL.
 */
function resolveUrl(url: string, baseUrl: string): string {
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	return new URL(url.replace(/^\/+/, ""), normalizeBaseUrl(baseUrl)).toString();
}

/**
 * Replaces placeholders in a route template.
 *
 * Supports both raw placeholders and URL-encoded placeholders. Values are
 * encoded before insertion.
 */
function replaceTemplateValues(url: string, values: TemplateValues): string {
	const result = Object.entries(values).reduce(
		(result, [placeholder, value]) => {
			if (value === undefined) return result;
			const encodedValue = encodeURIComponent(value);
			return result
				.replaceAll(placeholder, encodedValue)
				.replaceAll(encodeURIComponent(placeholder), encodedValue);
		},
		url,
	);

	// Remove any leftover unresolved placeholders, whether plain or encoded.
	return result.replace(/<.+?>/g, "").replace(/%3C.+?%3E/gi, "");
}

/**
 * Resolves a marketplace route template into a full URL.
 *
 * Placeholder values are encoded while the template is resolved.
 */
export function resolveTemplateUrl(
	template: string,
	marketplace: MarketplaceInfo,
	values: TemplateValues = {},
): string {
	const url = replaceTemplateValues(template, values);
	return resolveUrl(url, marketplace.baseUrl);
}
