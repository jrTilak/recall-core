import {
	type MarketplaceInfo,
	MarketplaceInfoSchema,
	type MarketplacePlugin,
	PLUGIN_NAME_PLACEHOLDER,
	PLUGIN_VERSION_PLACEHOLDER,
	PluginListResponseSchema,
	PluginResponseSchema,
	type PluginVersionResponse,
	PluginVersionResponseSchema,
	QUERY_PLACEHOLDER,
} from "../contracts";
import { fetchAndValidate } from "./request";
import type {
	ListPluginsOptions,
	MarketplaceClientOptions,
	MarketplaceFetch,
	PluginIdParts,
} from "./types";
import { resolveTemplateUrl } from "./url-template";

/**
 * Client for discovering and reading Recall-compatible marketplaces.
 */
export class MarketplaceClient {
	private readonly fetch: MarketplaceFetch;

	constructor(options: MarketplaceClientOptions = {}) {
		this.fetch = options.fetch ?? globalThis.fetch;
	}

	/** Builds the namespaced client-side plugin ID. */
	resolvePluginId(marketplace: MarketplaceInfo, pluginName: string): string {
		return `${marketplace.namespace}:${pluginName}`;
	}

	/**
	 * Separates the plugin name and marketplace namespace from a plugin ID.
	 * This is the opposite of `resolvePluginId`.
	 */
	splitPluginId(pluginId: string): PluginIdParts {
		const [namespace = "", name = ""] = pluginId.split(":");
		return { namespace, name };
	}

	/** Reads and validates the marketplace capability document. */
	async getMarketplaceInfo(baseUrl: string): Promise<MarketplaceInfo> {
		return fetchAndValidate(this.fetch, MarketplaceInfoSchema, baseUrl);
	}

	/** Lists all plugins exposed by the marketplace. */
	async listPlugins(
		marketplace: MarketplaceInfo,
		options: ListPluginsOptions = {},
	): Promise<MarketplacePlugin[]> {
		const url = resolveTemplateUrl(marketplace.urls.listPlugins, marketplace, {
			[QUERY_PLACEHOLDER]: options.search,
		});
		const plugins = await fetchAndValidate(
			this.fetch,
			PluginListResponseSchema,
			url,
		);
		return plugins.map((plugin) => ({
			...plugin,
			id: this.resolvePluginId(marketplace, plugin.name),
		}));
	}

	/** Reads a single plugin by package name. */
	async getPluginByName(
		marketplace: MarketplaceInfo,
		name: string,
	): Promise<MarketplacePlugin> {
		const url = resolveTemplateUrl(
			marketplace.urls.getPluginByName,
			marketplace,
			{
				[PLUGIN_NAME_PLACEHOLDER]: name,
			},
		);
		const plugin = await fetchAndValidate(
			this.fetch,
			PluginResponseSchema,
			url,
		);
		return { ...plugin, id: this.resolvePluginId(marketplace, plugin.name) };
	}

	/** Reads install metadata for a specific plugin version. */
	async getPluginVersion(
		marketplace: MarketplaceInfo,
		name: string,
		version: string,
	): Promise<PluginVersionResponse> {
		const url = resolveTemplateUrl(
			marketplace.urls.getPluginVersion,
			marketplace,
			{
				[PLUGIN_NAME_PLACEHOLDER]: name,
				[PLUGIN_VERSION_PLACEHOLDER]: version,
			},
		);
		return fetchAndValidate(this.fetch, PluginVersionResponseSchema, url);
	}
}
