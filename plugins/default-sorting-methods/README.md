# @jrtilak-recall/default-sorting-methods

Recall plugin providing the default sorting methods:

- Name, using case-insensitive natural sorting
- Created date
- Last modified date
- Custom numeric order

The plugin requests `options.sorting-methods.modify` so it can register these
methods across Recall apps.

## Development

Run the tests:

```bash
bun test
```

Type-check the plugin:

```bash
bunx tsc --noEmit -p tsconfig.json
```

Build it from this directory with the plugin creator:

```bash
bun ../../packages/plugin-creator/src/scripts/build-plugin.ts
```

The build writes the compiled entry point and manifest to `dist/`.
