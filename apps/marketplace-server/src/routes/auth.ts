import { Hono } from "hono";
import { createAuth } from "../auth/server";
import type { Env } from "../env";

type AppEnv = { Bindings: Env };

export const authRoute = new Hono<AppEnv>({ strict: false });

authRoute.on(["GET", "POST"], "/auth/*", (c) => {
	return createAuth(c).handler(c.req.raw);
});
