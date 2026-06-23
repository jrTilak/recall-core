import { describe, expect, test } from "bun:test";
import { sortByNumber } from "./sort-by-number";

describe("sortByNumber", () => {
  test("sorts numbers asc", () => {
    const items = [
      { name: "A", marks: 30 },
      { name: "B", marks: 10 },
      { name: "C", marks: 20 },
    ];

    const result = sortByNumber({
      items,
      config: {
        sortKey: "marks",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual(["B", "C", "A"]);
  });

  test("sorts numbers desc", () => {
    const items = [
      { name: "A", marks: 30 },
      { name: "B", marks: 10 },
      { name: "C", marks: 20 },
    ];

    const result = sortByNumber({
      items,
      config: {
        sortKey: "marks",
        order: "desc",
      },
    });

    expect(result.map((item) => item.name)).toEqual(["A", "C", "B"]);
  });

  test("supports numeric strings", () => {
    const items = [
      { name: "A", marks: "30" },
      { name: "B", marks: "10" },
      { name: "C", marks: "20" },
    ];

    const result = sortByNumber({
      items,
      config: {
        sortKey: "marks",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual(["B", "C", "A"]);
  });

  test("does not mutate original array", () => {
    const items = [
      { name: "A", marks: 2 },
      { name: "B", marks: 1 },
    ];

    const result = sortByNumber({
      items,
      config: {
        sortKey: "marks",
        order: "asc",
      },
    });

    expect(result).not.toBe(items);
    expect(items.map((item) => item.name)).toEqual(["A", "B"]);
    expect(result.map((item) => item.name)).toEqual(["B", "A"]);
  });

  test("moves invalid numbers to the end", () => {
    const items = [
      { name: "A", marks: "invalid" },
      { name: "B", marks: 30 },
      { name: "C", marks: null },
      { name: "E", marks: "" },
      { name: "F", marks: "   " },
      { name: "D", marks: 10 },
    ];

    const result = sortByNumber({
      items,
      config: {
        sortKey: "marks",
        order: "asc",
      },
    });

    expect(result.map((item) => item.name)).toEqual([
      "D",
      "B",
      "A",
      "C",
      "E",
      "F",
    ]);
  });
});
