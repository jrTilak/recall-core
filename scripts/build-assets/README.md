# Build Assets

Builds generated project assets from their source schemas.

```sh
bun run build
```

The build currently generates:

- Plugin and theme configuration schemas in `public/schema/v<manifest-version>/`.
- Marketplace response schemas in
  `public/schema/marketplace-interface/v<package-version>/`.
