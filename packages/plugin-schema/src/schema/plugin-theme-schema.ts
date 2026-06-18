import { z } from "zod";

/**
 * Color variable names supported by Recall themes.
 */
export const ThemeColorNameSchema = z.enum([
	/**
	 * Semantic colors.
	 */

	"primary",
	"primaryForeground",

	"background",
	"foreground",

	"muted",
	"mutedForeground",

	"card",

	"accent",

	"destructive",
	"destructiveLight", // destructiveLight can be used as background for destructive
	"destructiveForeground",

	"warning",
	"warningForeground",

	"success",
	"successForeground",

	"folder", // Default folder color.

	"ring", // Used when interactive elements are focused.
	"border",

	"popover",
	"popoverForeground",

	/**
	 * Non-semantic colors.
	 */
	"yellow",
	"black",
	"white",
]);

const ThemeColorValuesSchema = z
	.object(
		Object.fromEntries(
			ThemeColorNameSchema.options.map((name) => [name, z.string()]),
		),
	)
	.partial();

/**
 * One named theme and the UI variables it overrides.
 */
export const ThemeDefinitionSchema = z
	.object({
		name: z
			.string()
			.nonempty()
			.describe("Name of the color theme displayed to users."),
		theme: z.object({
			// TODO: Add support for other variables such as font sizes and spacing.
			colors: ThemeColorValuesSchema,
		}),
	})
	.describe("Semantic app color variables used across Recall");

/**
 * Theme configuration file containing one or more named themes.
 */
export const ThemeSchema = z.object({
	themes: z.array(ThemeDefinitionSchema),
});

export type ThemeColorName = z.output<typeof ThemeColorNameSchema>;
export type ThemeDefinitionInput = z.input<typeof ThemeDefinitionSchema>;
export type ThemeDefinition = z.output<typeof ThemeDefinitionSchema>;
export type ThemeInput = z.input<typeof ThemeSchema>;
export type Theme = z.output<typeof ThemeSchema>;
