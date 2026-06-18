import { describe, expect, test } from "bun:test";
import { renderHeader } from "./render";

describe("renderHeader", () => {
	test("renders guest navigation", () => {
		const header = renderHeader(null);

		expect(header).toContain("Recall");
		expect(header).toContain("Marketplace");
		expect(header).toContain('href="/upload"');
		expect(header).toContain('href="/login"');
		expect(header).toContain('href="/signup"');
		expect(header).not.toContain('action="/logout"');
	});

	test("renders authenticated navigation and escapes user content", () => {
		const header = renderHeader({
			user: {
				name: '<Admin "User">',
				email: "admin@example.com",
			},
		});

		expect(header).toContain("&lt;Admin &quot;User&quot;&gt;");
		expect(header).toContain('action="/logout"');
		expect(header).not.toContain('href="/login"');
		expect(header).not.toContain("<Admin");
	});
});
