import z from "zod";

export const ThemeColorVariables = z.enum([
  /**
   *  Semantic colors
   **/

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

  "folder",

  "ring",
  "border",

  "popover",
  "popoverForeground",

  /**
   *  Non-Semantic colors
   **/
  "yellow",
  "black",
  "white",
]);

export const ThemeColorsSchema = z
  .object({
    name: z
      .string()
      .nonempty()
      .describe("Name of the color theme displayed to users."),
    theme: z.object({
      // TODO: add support for other variables like font sizes, spacing etc in future
      colors: z
        .object(
          Object.fromEntries(
            ThemeColorVariables.options.map((k) => [k, z.string()]),
          ),
        )
        .partial(),
    }),
  })
  .describe("Semantic app color variables used across app");

export const ThemeSchema = z.object({
  themes: z.array(ThemeColorsSchema),
});

export type ThemeSchemaType = z.infer<typeof ThemeSchema>;
export type Theme = ThemeSchemaType;
