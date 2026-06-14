# Recall Marketplace Interface

Small client and schema package for Recall-compatible plugin marketplaces.

It defines the communication contract between the app and any marketplace. The
marketplace can implement storage, uploads, approval, moderation, styling, and
admin tools however it wants, as long as the API responses match the shared
schemas.

Start with a marketplace base URL that returns marketplace info. That info
contains identity fields and route templates for listing, searching, inspecting,
and reading plugin versions.

See [DOCS.md](./DOCS.md) for the marketplace contract and
[src/response-schemas.ts](./src/response-schemas.ts) for the exact schemas.
