import { describe, expect, test } from "bun:test";
import { parseStoredPermissions } from "./permissions";

describe("parseStoredPermissions", () => {
	test("parses valid stored permissions", () => {
		expect(
			parseStoredPermissions(JSON.stringify(["ui.theme.static.write"])),
		).toEqual(["ui.theme.static.write"]);
	});

	test("rejects unsupported permissions", () => {
		expect(
			parseStoredPermissions(JSON.stringify(["filesystem.write"])),
		).toEqual([]);
	});

	test("handles invalid and non-string database values", () => {
		expect(parseStoredPermissions("{invalid")).toEqual([]);
		expect(parseStoredPermissions(null)).toEqual([]);
	});
});
