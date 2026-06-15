/** Returns JSON with a status code. */
export function json(data: unknown, status = 200) {
	return Response.json(data, { status });
}

/** Builds an absolute URL using the current request URL. */
export function absoluteUrl(requestUrl: string, pathname: string) {
	const url = new URL(requestUrl);
	url.pathname = pathname;
	url.search = "";
	url.hash = "";
	return url.toString();
}
