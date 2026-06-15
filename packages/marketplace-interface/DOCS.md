# Marketplace Contract

A Recall marketplace is any server that exposes a compatible communication
interface. Internal implementation details can differ: storage, uploads,
approval flows, moderation, pages, styling, auth, and admin tools are all up to
the marketplace.
The app only needs a base URL that returns marketplace info. That response tells
the client who the marketplace is and which route templates to use next.

## Entry Point

`GET <marketplace-base-url>`
Returns `MarketplaceInfoSchema`, including:

- marketplace identity such as `name`, `namespace`, and optional metadata
- `baseUrl`, used to resolve relative routes
- `urls`, the route templates clients should call
  Exact schema: [src/response-schemas.ts](./src/response-schemas.ts)

## Route Templates

The marketplace info response should provide these URL templates:

- `listPlugins`: returns available plugins, supports optional `<query>` placeholder for filtering
- `getPluginByName`: returns one plugin for `<plugin-name>`
- `getPluginVersion`: returns install metadata for `<plugin-name>` and `<plugin-version>`
  Templates may be relative to `baseUrl` or absolute URLs. Supported placeholders:
- `<plugin-name>`
- `<plugin-version>`
- `<query>`

## Download Zip

`getPluginVersion` should return `downloadUrl` for one zip file for that plugin
version. This can be a public route, external storage URL, or short-lived
signed/rate-limited URL. Relative URLs resolve against the marketplace `baseUrl`.
Example download URLs:

- `/plugins/<plugin-name>/<plugin-version>.zip`
- `/plugins/<plugin-name>/<plugin-version>/plugin.zip`
- `https://storage.example.com/signed/plugin.zip?...`
  The zip should contain plugin files at its root:

```txt
plugin.zip
  manifest.json
  index.js
  theme.json
```

It should not wrap files in an extra top-level folder:

```txt
plugin.zip
  plugin-folder/
    manifest.json
    index.js
```

## Compatibility

Use the schemas in [src/response-schemas.ts](./src/response-schemas.ts) as the
source of truth. A marketplace is compatible when its responses validate against
those schemas, regardless of how the server is built internally.
