# Recall Plugin Schema

Zod schemas and TypeScript types for Recall plugin manifests and theme files.

```sh
bun add @jrtilak-recall/plugin-schema
```

## Plugin manifests

```ts
import {
	PluginConfigSchema,
	type PluginConfigInput,
} from "@jrtilak-recall/plugin-schema";

const manifest: PluginConfigInput = {
	name: "@recall/example",
	displayName: "Example Plugin",
	version: "1.0.0",
	author: "Recall",
	recall: {
		permissions: [],
		manifestVersion: "0.0.1",
		category: "others",
		main: "index.js",
	},
};

const validatedManifest = PluginConfigSchema.parse(manifest);
```

## Theme files

```ts
import { ThemeSchema, type ThemeInput } from "@jrtilak-recall/plugin-schema";

const theme: ThemeInput = {
	themes: [
		{
			name: "Example",
			theme: {
				colors: {
					primary: "#00bdb0",
					background: "#ffffff",
				},
			},
		},
	],
};

const validatedTheme = ThemeSchema.parse(theme);
```

See the [Plugin Schema documentation](https://docs.recall.jrtilak.dev/core-packages/plugin-schema/)
for package details and related resources.

## Sorting method permission

`options.sorting-methods.modify` allows a plugin to register, update, or remove
sorting method definitions.
