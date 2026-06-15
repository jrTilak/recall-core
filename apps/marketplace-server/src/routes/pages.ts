import { Hono } from "hono";
import { createAuth, getSession } from "../auth/server";
import type { Env } from "../env";
import { createRepo } from "../plugins/repository";
import { renderPage } from "../views/render";

type AppEnv = { Bindings: Env };

export const pagesRoute = new Hono<AppEnv>({ strict: false });

pagesRoute.get("/", async (c) => {
	const session = await getSession(c);
	const search = c.req.query("q")?.trim() ?? "";
	const plugins = await createRepo(c).findManyPlugins({ search });

	return html(
		renderPage("home", {
			title: "Recall Marketplace",
			session,
			search,
			marketplaceBaseUrl: new URL("/api/", c.req.url).toString(),
			plugins,
		}),
	);
});

pagesRoute.get("/plugins/:name", async (c) => {
	const session = await getSession(c);
	const name = decodeURIComponent(c.req.param("name"));
	const detail = await createRepo(c).findPluginDetailByName(name);

	if (!detail) return c.notFound();

	return html(
		renderPage("plugin-detail", {
			title: detail.plugin.displayName,
			session,
			...detail,
		}),
	);
});

pagesRoute.get("/upload", async (c) => {
	const session = await getSession(c);
	if (!session)
		return c.redirect(`/login?next=${encodeURIComponent("/upload")}`);

	return html(
		renderPage("upload", {
			title: "Upload Plugin",
			session,
		}),
	);
});

pagesRoute.get("/login", async (c) => {
	const session = await getSession(c);
	if (session) return c.redirect("/");

	return html(
		renderPage("login", {
			title: "Log In",
			session,
			next: c.req.query("next") ?? "/upload",
			error: c.req.query("error"),
		}),
	);
});

pagesRoute.post("/login", async (c) => {
	const form = await c.req.formData();
	const email = String(form.get("email") ?? "");
	const password = String(form.get("password") ?? "");
	const next = safeNext(String(form.get("next") ?? "/upload"));

	const authResponse = await createAuth(c).api.signInEmail({
		body: { email, password },
		headers: c.req.raw.headers,
		asResponse: true,
	});

	if (!authResponse.ok) {
		return c.redirect(
			`/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
				"Invalid email or password.",
			)}`,
		);
	}

	return redirectWithCookies(next, authResponse);
});

pagesRoute.get("/signup", async (c) => {
	const session = await getSession(c);
	if (session) return c.redirect("/");

	return html(
		renderPage("signup", {
			title: "Sign Up",
			session,
			next: c.req.query("next") ?? "/upload",
			error: c.req.query("error"),
		}),
	);
});

pagesRoute.post("/signup", async (c) => {
	const form = await c.req.formData();
	const name = String(form.get("name") ?? "");
	const email = String(form.get("email") ?? "");
	const password = String(form.get("password") ?? "");
	const next = safeNext(String(form.get("next") ?? "/upload"));

	const authResponse = await createAuth(c).api.signUpEmail({
		body: { name, email, password },
		headers: c.req.raw.headers,
		asResponse: true,
	});

	if (!authResponse.ok) {
		return c.redirect(
			`/signup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
				"Could not create that account.",
			)}`,
		);
	}

	return redirectWithCookies(next, authResponse);
});

pagesRoute.post("/logout", async (c) => {
	const authResponse = await createAuth(c).api.signOut({
		headers: c.req.raw.headers,
		asResponse: true,
	});

	return redirectWithCookies("/", authResponse);
});

function html(body: string) {
	return new Response(body, {
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}

function safeNext(value: string) {
	if (!value.startsWith("/") || value.startsWith("//")) return "/upload";
	return value;
}

function redirectWithCookies(location: string, source: Response) {
	const headers = new Headers({ location });
	const cookie = source.headers.get("set-cookie");
	if (cookie) headers.append("set-cookie", cookie);
	return new Response(null, { status: 303, headers });
}
