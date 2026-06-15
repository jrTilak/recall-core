import type { ZodType, z } from "zod";
import {
	FindPluginByNameSchema,
	ListPluginsResponseSchema,
	MarketplaceInfoSchema,
	type MarketplaceInfoType,
	PLUGIN_NAME_PLACEHOLDER,
	PLUGIN_VERSION_PLACEHOLDER,
	type PluginType,
	PluginVersionSchema,
	type PluginVersionType,
	QUERY_PLACEHOLDER,
} from "./response-schemas";

type TemplateValues = Record<string, string | undefined>;

class MarketplaceClient {
	/** Ensures a URL ends with a slash. */
	private _normalizeBaseUrl(url: string): string {
		return url.endsWith("/") ? url : `${url}/`;
	}

	/**
	 * Resolves a marketplace URL.
	 *
	 * Absolute HTTP URLs are returned as-is. Relative URLs are resolved against
	 * the provided marketplace base URL.
	 */
	private _resolveUrl(url: string, baseUrl: string): string {
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		return new URL(
			url.replace(/^\/+/, ""),
			this._normalizeBaseUrl(baseUrl),
		).toString();
	}

	/**
	 * Replaces placeholders in a route template.
	 *
	 * Supports both raw placeholders and URL-encoded placeholders.
	 */
	private _replaceTemplateValues(url: string, values: TemplateValues): string {
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

		// Remove any leftover unresolved placeholders (plain or URL-encoded)
		return result.replace(/<.+?>/g, "").replace(/%3C.+?%3E/gi, "");
	}

	/**
	 * Resolves a marketplace route template into a full URL.
	 *
	 * Placeholder values should already be encoded for their URL position.
	 */
	private _resolveTemplateUrl(
		template: string,
		marketplace: MarketplaceInfoType,
		values: TemplateValues = {},
	): string {
		const url = this._replaceTemplateValues(template, values);
		return this._resolveUrl(url, marketplace.baseUrl);
	}

	/**
	 * Fetches a marketplace endpoint and validates its response using the
	 * provided Zod schema. Uses global fetch and returns parsed data.
	 */
	private async _fetchAndValidate<T extends ZodType>(
		schema: T,
		url: string,
	): Promise<z.output<T>> {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error(`Request to ${url} failed with status ${res.status}`);
		}

		let data: unknown;
		try {
			const text = await res.text();
			data = text ? JSON.parse(text) : {};
		} catch (err) {
			throw new Error(
				`Invalid JSON response from ${url}: ${(err as Error).message}`,
			);
		}

		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			throw new Error(
				`Response validation failed for ${url}: ${parsed.error.message}`,
			);
		}

		return parsed.data as z.output<T>;
	}

	/** Builds the namespaced plugin ID. */
	resolvePluginId(
		marketplace: MarketplaceInfoType,
		pluginName: string,
	): string {
		return `${marketplace.namespace}:${pluginName}`;
	}

	/**
	 * Separates the plugin name and marketplace namespace from a plugin ID.
	 * Opposite of `resolvePluginId`.
	 */
	splitPluginId(pluginId: string): { namespace: string; name: string } {
		const [namespace = "", name = ""] = pluginId.split(":");
		return { namespace, name };
	}

	/** Reads the marketplace capability document. */
	async getMarketplaceInfo(baseUrl: string): Promise<MarketplaceInfoType> {
		return this._fetchAndValidate(MarketplaceInfoSchema, baseUrl);
	}

	/** Lists all plugins exposed by the marketplace. */
	async listPlugins(
		marketplace: MarketplaceInfoType,
		filter: { search?: string } = {},
	): Promise<PluginType[]> {
		const url = this._resolveTemplateUrl(
			marketplace.urls.listPlugins,
			marketplace,
			{
				[QUERY_PLACEHOLDER]: filter.search,
			},
		);
		const plugins = await this._fetchAndValidate(
			ListPluginsResponseSchema,
			url,
		);
		return plugins.map((plugin) => ({
			...plugin,
			id: this.resolvePluginId(marketplace, plugin.name),
		}));
	}
	/** Reads a single plugin by package name. */
	async getPluginByName(
		name: string,
		marketplace: MarketplaceInfoType,
	): Promise<PluginType> {
		const url = this._resolveTemplateUrl(
			marketplace.urls.getPluginByName,
			marketplace,
			{
				[PLUGIN_NAME_PLACEHOLDER]: name,
			},
		);
		const plugin = await this._fetchAndValidate(FindPluginByNameSchema, url);
		return { ...plugin, id: this.resolvePluginId(marketplace, plugin.name) };
	}

	/** Reads install metadata for a specific plugin version. */
	async getPluginVersion(
		name: string,
		version: string,
		marketplace: MarketplaceInfoType,
	): Promise<PluginVersionType> {
		const url = this._resolveTemplateUrl(
			marketplace.urls.getPluginVersion,
			marketplace,
			{
				[PLUGIN_NAME_PLACEHOLDER]: name,
				[PLUGIN_VERSION_PLACEHOLDER]: version,
			},
		);
		return this._fetchAndValidate(PluginVersionSchema, url);
	}
}

export const Marketplace = new MarketplaceClient();
