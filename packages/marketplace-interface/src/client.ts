import { MarketplaceClient } from "./client/marketplace-client";
import type { MarketplaceClientOptions } from "./client/types";

export { MarketplaceClient } from "./client/marketplace-client";
export type {
	ListPluginsOptions,
	MarketplaceClientOptions,
	MarketplaceFetch,
	PluginIdParts,
} from "./client/types";
export type {
	MarketplaceInfo,
	MarketplacePlugin,
	PluginResponse,
	PluginVersionResponse,
} from "./contracts";

/** Creates an isolated marketplace client with optional runtime dependencies. */
export function createMarketplaceClient(
	options: MarketplaceClientOptions = {},
): MarketplaceClient {
	return new MarketplaceClient(options);
}

/**
 * Shared marketplace client using the global Fetch API.
 *
 * Use `createMarketplaceClient` when a custom fetch implementation is required.
 */
export const Marketplace = createMarketplaceClient();
