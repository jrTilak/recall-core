export type MarketplaceFetch = (
	...args: Parameters<typeof globalThis.fetch>
) => ReturnType<typeof globalThis.fetch>;

export interface MarketplaceClientOptions {
	/**
	 * Fetch implementation used for marketplace requests.
	 *
	 * Defaults to `globalThis.fetch`. Supplying it explicitly is useful for
	 * tests, request instrumentation, authentication, and runtimes with a custom
	 * fetch implementation.
	 */
	fetch?: MarketplaceFetch;
}

export interface ListPluginsOptions {
	/** Optional text used to replace the `<query>` route placeholder. */
	search?: string;
}

export interface PluginIdParts {
	namespace: string;
	name: string;
}
