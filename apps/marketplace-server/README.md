# Recall Marketplace Server

Cloudflare Worker marketplace server for Recall plugins.

Uses:

- Worker for HTTP routes
- D1 for plugin metadata
- R2 for plugin zip files at `plugins/<plugin-name>/<version>/plugin.zip`

## Setup

```bash
bun install
cp marketplace/marketplace-server/.env.example marketplace/marketplace-server/.env
```

Fill Cloudflare IDs in `.env` and `wrangler.jsonc`.

## Local Dev

```bash
bun run --cwd marketplace/marketplace-server dev
```

Apply local D1 migrations:

```bash
wrangler d1 migrations apply DB --local
```

## Production

Deploy:

```bash
cd marketplace/marketplace-server
wrangler deploy --name "recall-marketplace-worker" --env production --latest
```

Apply remote D1 migrations:

```bash
cd marketplace/marketplace-server
wrangler d1 migrations apply DB --remote
```

Cloudflare does not apply D1 migrations automatically during deploy.

## Routes

```txt
GET  /                         upload UI
GET  /api/                     marketplace info
GET  /api/plugins              list plugins
GET  /api/plugins?q=<query>    search plugins
GET  /api/plugins/:name        plugin details
GET  /api/plugins/:name/:version
GET  /api/plugins/:name/:version/plugin.zip
POST /api/plugins              upload plugin zip
```

Version responses include the plugin permission strings from the uploaded
manifest.
