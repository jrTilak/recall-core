import { describe, expect, test } from "bun:test";
import { naturalSort } from "./natural-sort";

describe("naturalSort", () => {
  test("sorts naturally asc", () => {
    const items = [
      { name: "file10" },
      { name: "file2" },
      { name: "file1" },
      { name: "file20" },
    ];

    const result = naturalSort({
      items,
      config: {
        sortKey: "name",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual([
      "file1",
      "file2",
      "file10",
      "file20",
    ]);
  });

  test("sorts naturally desc", () => {
    const items = [
      { name: "file10" },
      { name: "file2" },
      { name: "file1" },
      { name: "file20" },
    ];

    const result = naturalSort({
      items,
      config: {
        sortKey: "name",
        order: "desc",
      },
    });

    expect(result.map((item) => item.name)).toEqual([
      "file20",
      "file10",
      "file2",
      "file1",
    ]);
  });

  test("sorts case-insensitively", () => {
    const items = [
      { name: "Banana" },
      { name: "apple" },
      { name: "Cherry" },
    ];

    const result = naturalSort({
      items,
      config: {
        sortKey: "name",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual([
      "apple",
      "Banana",
      "Cherry",
    ]);
  });

  test("does not mutate original array", () => {
    const items = [
      { name: "item2" },
      { name: "item1" },
    ];

    const result = naturalSort({
      items,
      config: {
        sortKey: "name",
        order: "asc",
      },
    });

    expect(result).not.toBe(items);
    expect(items.map((item) => item.name)).toEqual(["item2", "item1"]);
    expect(result.map((item) => item.name)).toEqual(["item1", "item2"]);
  });

  test("handles null and undefined values", () => {
    const items = [
      { name: "file2" },
      { name: null },
      { name: "file1" },
      { name: undefined },
    ];

    const result = naturalSort({
      items,
      config: {
        sortKey: "name",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual([
      null,
      undefined,
      "file1",
      "file2",
    ]);
  });
});
