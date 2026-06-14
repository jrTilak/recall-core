import z from "zod";

export const Permissions = z.enum([
  /**
   * Change the color theme and other ui variables statically via config
   * Genrally used to modify the overall theme of app.
   * Only this Permission is sufficient for theme plugins
   **/
  "ui.theme.static.write",
]);

export type Permission = z.infer<typeof Permissions>;
