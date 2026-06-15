import { html, raw } from "hono/html";

type PageName = "home" | "plugin-detail" | "upload" | "login" | "signup";

type SessionData = {
	user: {
		name: string;
		email: string;
	};
} | null;

type RenderData = Record<string, unknown> & {
	title: string;
	session: SessionData;
};

type PluginCard = {
	name: string;
	displayName: string;
	description?: string | null;
	latestVersion: string;
	totalDownloads: number;
	category?: string | null;
	iconUrl?: string | null;
};

type PluginDetail = PluginCard & {
	author: string;
	homepageUrl?: string | null;
};

type Publisher = {
	username: string;
	isVerified: boolean;
} | null;

type Version = {
	version: string;
	size: number;
	manifestVersion: string;
	permissions: string;
	createdAt: string;
};

const helpers = {
	formatBytes(value: unknown) {
		const bytes = Number(value ?? 0);
		if (!Number.isFinite(bytes)) return "0 B";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	},
	formatDate(value: unknown) {
		if (!value) return "Unknown";
		const date = new Date(String(value));
		if (Number.isNaN(date.getTime())) return "Unknown";
		return date.toLocaleDateString("en", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	},
	permissions(value: unknown) {
		if (typeof value !== "string") return [];
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed.map(String) : [];
		} catch {
			return [];
		}
	},
};

export function renderPage(name: PageName, data: RenderData) {
	const content = pages[name](data);

	return String(html`<!doctype html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>${data.title} - Recall Marketplace</title>
				<link
					href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
					rel="stylesheet"
				/>
				<style>
					:root {
						--rm-primary: #00bdb0;
						--rm-primary-ink: #ffffff;
						--rm-accent: #f26040;
						--rm-bg: #ffffff;
						--rm-ink: #0f1a1a;
						--rm-muted: #f1f3f5;
						--rm-muted-ink: #6b7280;
						--rm-card: #f3f4f6;
						--rm-border: #e2e5e8;
						--rm-warning: #f5a20a;
						--rm-success: #22c55e;
						--bs-body-color: var(--rm-ink);
						--bs-body-bg: var(--rm-bg);
						--bs-primary: var(--rm-primary);
						--bs-primary-rgb: 0, 189, 176;
						--bs-link-color-rgb: 0, 143, 133;
					}
					body {
						background:
							linear-gradient(180deg, rgba(0, 189, 176, .09) 0, rgba(255, 255, 255, 0) 280px),
							var(--rm-bg);
						font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
					}
					.navbar {
						background: rgba(255, 255, 255, .86);
						backdrop-filter: blur(16px);
						border-bottom: 1px solid var(--rm-border);
					}
					.brand-mark {
						width: 34px;
						height: 34px;
						border-radius: 8px;
						background: var(--rm-ink);
						color: var(--rm-primary);
						display: inline-grid;
						place-items: center;
						font-weight: 800;
					}
					.btn {
						border-radius: 8px;
						font-weight: 650;
					}
					.btn-primary {
						--bs-btn-bg: var(--rm-primary);
						--bs-btn-border-color: var(--rm-primary);
						--bs-btn-color: var(--rm-primary-ink);
						--bs-btn-hover-bg: #00a99e;
						--bs-btn-hover-border-color: #00a99e;
						box-shadow: 0 10px 24px rgba(0, 189, 176, .22);
					}
					.btn-dark {
						--bs-btn-bg: var(--rm-ink);
						--bs-btn-border-color: var(--rm-ink);
					}
					.btn-outline-secondary,
					.btn-outline-dark {
						--bs-btn-border-color: var(--rm-border);
						--bs-btn-color: var(--rm-ink);
						--bs-btn-hover-bg: var(--rm-ink);
						--bs-btn-hover-border-color: var(--rm-ink);
					}
					.market-hero {
						background: var(--rm-ink);
						color: #f0f2f3;
						border: 1px solid rgba(15, 26, 26, .12);
						border-radius: 8px;
						padding: clamp(24px, 4vw, 44px);
						position: relative;
						overflow: hidden;
					}
					.market-hero::after {
						content: "";
						position: absolute;
						inset: auto -80px -110px auto;
						width: 260px;
						height: 260px;
						background: var(--rm-primary);
						opacity: .18;
						transform: rotate(22deg);
					}
					.market-eyebrow {
						color: var(--rm-primary);
						font-size: .78rem;
						font-weight: 800;
						letter-spacing: .08em;
						text-transform: uppercase;
					}
					.market-search {
						background: rgba(255, 255, 255, .08);
						border: 1px solid rgba(255, 255, 255, .16);
						border-radius: 8px;
						padding: 8px;
						position: relative;
						z-index: 1;
					}
					.form-control,
					.form-control:focus {
						border-color: var(--rm-border);
						border-radius: 8px;
						box-shadow: none;
					}
					.form-control:focus {
						border-color: var(--rm-primary);
						box-shadow: 0 0 0 .2rem rgba(0, 189, 176, .14);
					}
					.plugin-grid {
						display: grid;
						gap: 12px;
					}
					.plugin-tile {
						display: grid;
						grid-template-columns: auto 1fr auto;
						gap: 16px;
						align-items: center;
						padding: 18px;
						background: var(--rm-card);
						border: 1px solid var(--rm-border);
						border-radius: 8px;
						color: var(--rm-ink);
						text-decoration: none;
						transition: transform .16s ease, border-color .16s ease, background-color .16s ease;
					}
					.plugin-tile:hover {
						background: #ffffff;
						border-color: rgba(0, 189, 176, .58);
						transform: translateY(-1px);
					}
					.plugin-icon {
						width: 52px;
						height: 52px;
						border-radius: 8px;
						object-fit: cover;
						background: var(--rm-muted);
						border: 1px solid var(--rm-border);
					}
					.plugin-placeholder {
						width: 52px;
						height: 52px;
						border-radius: 8px;
						background: var(--rm-ink);
						color: var(--rm-primary);
						display: grid;
						place-items: center;
						font-weight: 800;
					}
					.meta-chip,
					.badge-soft {
						display: inline-flex;
						align-items: center;
						min-height: 24px;
						padding: 3px 8px;
						border-radius: 999px;
						background: #ffffff;
						border: 1px solid var(--rm-border);
						color: var(--rm-muted-ink);
						font-size: .78rem;
						font-weight: 650;
					}
					.category-chip {
						color: #9a3412;
						background: rgba(242, 96, 64, .1);
						border-color: rgba(242, 96, 64, .2);
					}
					.code-copy {
						display: grid;
						grid-template-columns: 1fr auto;
						gap: 10px;
						align-items: center;
						background: var(--rm-ink);
						color: #f0f2f3;
						border: 1px solid rgba(15, 26, 26, .08);
						border-radius: 8px;
						padding: 10px;
					}
					.code-copy code {
						display: block;
						color: var(--rm-primary);
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						padding: 0 4px;
					}
					.surface {
						background: var(--rm-card);
						border: 1px solid var(--rm-border);
						border-radius: 8px;
					}
					.detail-shell {
						background: var(--rm-ink);
						color: #f0f2f3;
						border-radius: 8px;
						padding: clamp(24px, 4vw, 44px);
					}
					.detail-shell .text-secondary,
					.detail-shell .detail-label {
						color: #a8b1b8 !important;
					}
					.detail-shell a {
						color: var(--rm-primary);
					}
					.detail-value {
						color: inherit;
						font-weight: 650;
						overflow-wrap: anywhere;
					}
					.version-panel,
					.form-panel {
						background: #ffffff;
						border: 1px solid var(--rm-border);
						border-radius: 8px;
						box-shadow: 0 18px 50px rgba(15, 26, 26, .07);
					}
					.table {
						--bs-table-bg: transparent;
						--bs-table-border-color: var(--rm-border);
					}
					.table thead th {
						color: var(--rm-muted-ink);
						font-size: .78rem;
						text-transform: uppercase;
						font-weight: 800;
					}
					.form-shell { max-width: 560px; }
					.empty-state {
						background: var(--rm-card);
						border: 1px dashed rgba(0, 189, 176, .45);
						border-radius: 8px;
					}
					@media (max-width: 720px) {
						.plugin-tile {
							grid-template-columns: auto 1fr;
						}
						.plugin-tile-actions {
							grid-column: 1 / -1;
						}
						.code-copy {
							grid-template-columns: 1fr;
						}
					}
				</style>
			</head>
			<body>
				<nav class="navbar navbar-expand-lg sticky-top">
					<div class="container py-2">
						<a class="navbar-brand d-flex align-items-center gap-2 fw-semibold" href="/">
							<span class="brand-mark">R</span>
							<span>Recall Marketplace</span>
						</a>
						<div class="d-flex align-items-center gap-2 ms-auto">
							<a class="btn btn-primary" href="/upload">Upload Plugin</a>
							${
								data.session
									? raw(`<span class="text-secondary small d-none d-sm-inline">${escapeHtml(data.session.user.name || data.session.user.email)}</span>
									<form method="post" action="/logout" class="m-0">
										<button class="btn btn-outline-secondary" type="submit">Log out</button>
									</form>`)
									: raw(`<a class="btn btn-outline-secondary" href="/login">Log in</a>
									<a class="btn btn-outline-dark" href="/signup">Sign up</a>`)
							}
						</div>
					</div>
				</nav>
				<main class="container py-4 py-lg-5">${raw(content)}</main>
				<script>
					document.addEventListener("click", async (event) => {
						const button = event.target.closest("[data-copy]");
						if (!button) return;
						const target = document.querySelector(button.dataset.copy);
						if (!target) return;
						await navigator.clipboard.writeText(target.textContent.trim());
						const label = button.textContent;
						button.textContent = "Copied";
						setTimeout(() => {
							button.textContent = label;
						}, 1200);
					});
				</script>
			</body>
		</html>`);
}

const pages: Record<PageName, (data: RenderData) => string> = {
	home(data) {
		const plugins = data.plugins as PluginCard[];
		const search = String(data.search ?? "");
		const marketplaceBaseUrl = String(data.marketplaceBaseUrl ?? "/api/");

		return String(html`<section class="market-hero mb-4">
				<div class="row g-4 align-items-end">
					<div class="col-lg-7">
						<div class="market-eyebrow mb-2">Plugin Registry</div>
						<h1 class="display-6 fw-bold mb-3">Recall Marketplace</h1>
						<p class="mb-0 text-white-50">
							Browse, publish, and install plugins from this marketplace.
						</p>
					</div>
					<div class="col-lg-5">
						<form class="market-search d-flex gap-2" method="get" action="/">
							<input
								class="form-control border-0"
								type="search"
								name="q"
								value="${search}"
								placeholder="Search plugins"
							/>
							<button class="btn btn-primary" type="submit">Search</button>
						</form>
					</div>
				</div>
			</section>

			<section class="surface p-3 p-lg-4 mb-4">
				<div class="row g-3 align-items-center">
					<div class="col-lg-5">
						<div class="market-eyebrow mb-2">Add to Recall</div>
						<h2 class="h5 mb-1">Marketplace base URL</h2>
						<p class="text-secondary mb-0">
							Use this URL in the app to install plugins from this registry.
						</p>
					</div>
					<div class="col-lg-7">
						<div class="code-copy">
							<code id="marketplace-base-url">${marketplaceBaseUrl}</code>
							<button
								class="btn btn-dark btn-sm"
								type="button"
								data-copy="#marketplace-base-url"
							>
								Copy
							</button>
						</div>
					</div>
				</div>
			</section>

			${
				plugins.length === 0
					? raw(`<div class="empty-state p-5 text-center">
					<h2 class="h5">No plugins found</h2>
					<p class="text-secondary mb-3">Try a different search, or upload the first plugin.</p>
					<a class="btn btn-primary" href="/upload">Upload Plugin</a>
				</div>`)
					: raw(
							`<div class="plugin-grid">${plugins.map(pluginCard).join("")}</div>`,
						)
			}`);
	},

	"plugin-detail"(data) {
		const plugin = data.plugin as PluginDetail;
		const publisher = data.publisher as Publisher;
		const versions = data.versions as Version[];

		return String(html`<div class="detail-shell mb-4">
				<div class="d-flex flex-column flex-lg-row gap-4">
					${raw(pluginIcon(plugin))}
					<div class="flex-grow-1">
						<div class="d-flex flex-wrap gap-2 align-items-center mb-2">
							<h1 class="h2 mb-0">${plugin.displayName}</h1>
							<span class="meta-chip">v${plugin.latestVersion}</span>
							${
								plugin.category
									? raw(
											`<span class="meta-chip category-chip">${escapeHtml(plugin.category)}</span>`,
										)
									: ""
							}
						</div>
						<p class="text-secondary mb-3">
							${plugin.description || "No description provided."}
						</p>
						<div class="row g-3 small">
							${raw(detailItem("Package", plugin.name))}
							${raw(detailItem("Author", plugin.author))}
							${raw(detailItem("Publisher", publisherLabel(publisher)))}
							${raw(detailItem("Downloads", String(plugin.totalDownloads)))}
							${
								plugin.homepageUrl
									? raw(
											`<div class="col-12"><span class="text-secondary">Homepage</span><div><a href="${escapeHtml(plugin.homepageUrl)}" target="_blank" rel="noreferrer">${escapeHtml(plugin.homepageUrl)}</a></div></div>`,
										)
									: ""
							}
						</div>
					</div>
				</div>
			</div>

			<div class="version-panel">
				<div class="px-3 px-lg-4 py-3 border-bottom">
					<h2 class="h5 mb-0">Versions</h2>
				</div>
				<div class="table-responsive">
					<table class="table align-middle mb-0">
						<thead>
							<tr>
								<th>Version</th>
								<th>Size</th>
								<th>Manifest</th>
								<th>Permissions</th>
								<th>Published</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${raw(versions.map((version) => versionRow(plugin.name, version)).join(""))}
						</tbody>
					</table>
				</div>
			</div>`);
	},

	upload() {
		return String(html`<div class="form-shell mx-auto">
			<div class="form-panel">
				<div class="p-4 p-lg-5">
					<div class="market-eyebrow mb-2">Publisher Tools</div>
					<h1 class="h3 mb-2">Upload Plugin</h1>
					<p class="text-secondary">
						Select a Recall plugin zip. The archive must contain
						<code>manifest.json</code> at the root.
					</p>
					<form
						action="/api/plugins"
						method="post"
						enctype="multipart/form-data"
						class="vstack gap-3"
					>
						<div>
							<label class="form-label" for="plugin">Plugin zip</label>
							<input
								class="form-control form-control-lg"
								id="plugin"
								name="plugin"
								type="file"
								accept=".zip,application/zip"
								required
							/>
						</div>
						<button class="btn btn-primary btn-lg" type="submit">
							Upload Plugin
						</button>
					</form>
				</div>
			</div>
		</div>`);
	},

	login(data) {
		return authForm("login", data);
	},

	signup(data) {
		return authForm("signup", data);
	},
};

function pluginCard(plugin: PluginCard) {
	return String(html`<a
		class="plugin-tile"
		href="/plugins/${encodeURIComponent(plugin.name)}"
	>
		${raw(pluginIcon(plugin))}
		<div class="min-w-0">
			<div class="d-flex flex-wrap align-items-center gap-2 mb-1">
				<h2 class="h5 mb-0">${plugin.displayName}</h2>
				<span class="meta-chip">v${plugin.latestVersion}</span>
				${
					plugin.category
						? raw(
								`<span class="meta-chip category-chip">${escapeHtml(plugin.category)}</span>`,
							)
						: ""
				}
			</div>
			<div class="small text-secondary mb-2">${plugin.name}</div>
			<p class="text-secondary mb-0">
				${plugin.description || "No description provided."}
			</p>
		</div>
		<div class="plugin-tile-actions text-lg-end">
			<div class="fw-semibold">${plugin.totalDownloads}</div>
			<div class="small text-secondary">downloads</div>
		</div>
	</a>`);
}

function pluginIcon(plugin: Pick<PluginCard, "displayName" | "iconUrl">) {
	if (plugin.iconUrl) {
		return `<img class="plugin-icon" src="${escapeHtml(plugin.iconUrl)}" alt="" />`;
	}
	return `<div class="plugin-placeholder">${escapeHtml(plugin.displayName.slice(0, 1).toUpperCase())}</div>`;
}

function detailItem(label: string, value: string) {
	return `<div class="col-md-6"><span class="detail-label small">${escapeHtml(label)}</span><div class="detail-value">${value}</div></div>`;
}

function publisherLabel(publisher: Publisher) {
	if (!publisher) return "Unknown";
	const verified = publisher.isVerified
		? '<span class="badge text-bg-success ms-1">Verified</span>'
		: "";
	return `@${escapeHtml(publisher.username)}${verified}`;
}

function versionRow(pluginName: string, version: Version) {
	const permissions = helpers.permissions(version.permissions);
	const permissionMarkup =
		permissions.length === 0
			? '<span class="text-secondary">None</span>'
			: permissions
					.map(
						(permission) =>
							`<span class="meta-chip me-1">${escapeHtml(permission)}</span>`,
					)
					.join("");

	return `<tr>
		<td class="fw-medium">${escapeHtml(version.version)}</td>
		<td>${escapeHtml(helpers.formatBytes(version.size))}</td>
		<td>${escapeHtml(version.manifestVersion)}</td>
		<td>${permissionMarkup}</td>
		<td>${escapeHtml(helpers.formatDate(version.createdAt))}</td>
		<td class="text-end">
			<a class="btn btn-sm btn-outline-primary" href="/api/plugins/${encodeURIComponent(pluginName)}/${encodeURIComponent(version.version)}/plugin.zip">Download</a>
		</td>
	</tr>`;
}

function authForm(kind: "login" | "signup", data: RenderData) {
	const next = String(data.next ?? "/upload");
	const error = data.error ? String(data.error) : "";
	const isSignup = kind === "signup";

	return String(html`<div class="form-shell mx-auto">
		<div class="form-panel">
			<div class="p-4 p-lg-5">
				<div class="market-eyebrow mb-2">Publisher Access</div>
				<h1 class="h3 mb-2">${isSignup ? "Sign Up" : "Log In"}</h1>
				<p class="text-secondary">
					${
						isSignup
							? "Create a publisher account with email and password."
							: "Use your email and password to publish plugins."
					}
				</p>
				${
					error
						? raw(`<div class="alert alert-danger">${escapeHtml(error)}</div>`)
						: ""
				}
				<form action="/${kind}" method="post" class="vstack gap-3">
					<input type="hidden" name="next" value="${next}" />
					${
						isSignup
							? raw(`<div>
							<label class="form-label" for="name">Name</label>
							<input class="form-control" id="name" name="name" type="text" autocomplete="name" required />
						</div>`)
							: ""
					}
					<div>
						<label class="form-label" for="email">Email</label>
						<input
							class="form-control"
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
						/>
					</div>
					<div>
						<label class="form-label" for="password">Password</label>
						<input
							class="form-control"
							id="password"
							name="password"
							type="password"
							autocomplete="${isSignup ? "new-password" : "current-password"}"
							minlength="${isSignup ? "8" : ""}"
							required
						/>
					</div>
					<button class="btn btn-primary" type="submit">
						${isSignup ? "Create Account" : "Log In"}
					</button>
				</form>
				<p class="text-secondary mt-3 mb-0">
					${raw(
						isSignup
							? `Already registered? <a href="/login?next=${encodeURIComponent(next)}">Log in</a>.`
							: `No account yet? <a href="/signup?next=${encodeURIComponent(next)}">Sign up</a>.`,
					)}
				</p>
			</div>
		</div>
	</div>`);
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}
