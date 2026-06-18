# Recall Marketplace Interface

Client and schema package for Recall-compatible plugin marketplaces.

Marketplace servers can import response schemas and input types without
including the HTTP client:

```ts
import {
  MarketplaceInfoSchema,
  type MarketplaceInfoInput,
} from "@jrtilak-recall/marketplace-interface/server";
```

Recall clients can import only the marketplace client:

```ts
import {
  createMarketplaceClient,
  type MarketplaceInfo,
} from "@jrtilak-recall/marketplace-interface/client";
```

See the [Marketplace Interface documentation](https://docs.recall.jrtilak.dev/core-packages/marketplace-interface/)
for the marketplace contract and usage details.
