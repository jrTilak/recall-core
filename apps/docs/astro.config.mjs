// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightThemeVintage from "starlight-theme-vintage";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Recall",
			plugins: [starlightThemeVintage()],
			customCss: ["./src/styles/global.css"],
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/jrTilak/recall-core",
				},
			],
			sidebar: [
				{
					label: "Core Packages",
					items: [
						{ label: "Overview", slug: "core-packages" },
						{
							label: "Marketplace Interface",
							slug: "core-packages/marketplace-interface",
						},
					],
				},
			],
		}),
	],
});
