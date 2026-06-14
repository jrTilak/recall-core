import { logger } from "@recall/logger";
import z from "zod";
import { ThemeSchema } from "../schema";
import {
  LATEST_MANIFEST_VERSION,
  PluginConfigSchema,
} from "../schema/plugin-config.schema";

logger.info("Generating JSON Schemas...");

const jsonSchema = z.toJSONSchema(PluginConfigSchema);

const extended = {
  allOf: [{ $ref: "https://json.schemastore.org/package.json" }],
  ...jsonSchema, // spreads at root level, overrides same fields from ref
  additionalProperties: true,
};

Bun.write(
  `schemes/v${LATEST_MANIFEST_VERSION}/plugin-config-schema.json`,
  JSON.stringify(extended, null, 2),
);

logger.info("Plugin config schema generated");

const themeConfigSchema = z.toJSONSchema(
  ThemeSchema.extend({
    $schema: z.string(),
  }),
);

Bun.write(
  `schemes/v${LATEST_MANIFEST_VERSION}/theme-config-schema.json`,
  JSON.stringify(themeConfigSchema, null, 2),
);

logger.info("Plugin theme schema generated");
