import { Hono } from "hono";
import type { Env } from "./env";
import { apiRoute } from "./routes/api";
import { authRoute } from "./routes/auth";
import { pagesRoute } from "./routes/pages";
import { uploadRoute } from "./routes/upload";

const app = new Hono<{ Bindings: Env }>({ strict: false });

app.route("/", pagesRoute);
app.route("/api", authRoute);
app.route("/api", uploadRoute);
app.route("/api", apiRoute);

app.onError((error) => {
	return Response.json(
		{
			error: "Internal server error",
			message: error instanceof Error ? error.message : "Unknown error",
		},
		{ status: 500 },
	);
});

export default app;
