import { betterAuth } from "better-auth";
import type { Context } from "hono";
import type { Env } from "../env";

type AppContext = Context<{ Bindings: Env }>;
type AuthEnv = Env & {
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
};

export function createAuth(c: AppContext) {
	const env = c.env as AuthEnv;
	const origin = new URL(c.req.url).origin;

	return betterAuth({
		baseURL: env.BETTER_AUTH_URL ?? origin,
		secret: env.BETTER_AUTH_SECRET ?? "local-dev-change-me",
		database: c.env.DB,
		emailAndPassword: {
			enabled: true,
		},
	});
}

export async function getSession(c: AppContext) {
	return createAuth(c).api.getSession({
		headers: c.req.raw.headers,
	});
}

export async function requireSession(c: AppContext) {
	const session = await getSession(c);
	if (!session) return null;
	return session;
}
