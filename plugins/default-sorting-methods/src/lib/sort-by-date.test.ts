import { describe, expect, test } from "bun:test";
import { sortByDate } from "./sort-by-date";

describe("sortByDate", () => {
  test("sorts by date desc", () => {
    const items = [
      { title: "A", createdAt: "2024-01-01" },
      { title: "B", createdAt: "2024-03-01" },
      { title: "C", createdAt: "2024-02-01" },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "desc",
      },
    });

    expect(result.map((item) => item.title)).toEqual(["B", "C", "A"]);
  });

  test("sorts by date asc", () => {
    const items = [
      { title: "A", createdAt: "2024-01-01" },
      { title: "B", createdAt: "2024-03-01" },
      { title: "C", createdAt: "2024-02-01" },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "asc",
      },
    });

    expect(result.map((item) => item.title)).toEqual(["A", "C", "B"]);
  });

  test("does not mutate original array", () => {
    const items = [
      { title: "A", createdAt: "2024-01-01" },
      { title: "B", createdAt: "2024-03-01" },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "desc",
      },
    });

    expect(result).not.toBe(items);
    expect(items.map((item) => item.title)).toEqual(["A", "B"]);
  });

  test("moves invalid dates to the end", () => {
    const items = [
      { title: "A", createdAt: "invalid-date" },
      { title: "B", createdAt: "2024-03-01" },
      { title: "C", createdAt: null },
      { title: "D", createdAt: "2024-01-01" },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "desc",
      },
    });

    expect(result.map((item) => item.title)).toEqual(["B", "D", "A", "C"]);
  });

  test("supports Date objects", () => {
    const items = [
      { title: "A", createdAt: new Date("2024-01-01") },
      { title: "B", createdAt: new Date("2024-03-01") },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "desc",
      },
    });

    expect(result.map((item) => item.title)).toEqual(["B", "A"]);
  });

  test("supports timestamp numbers", () => {
    const items = [
      { title: "A", createdAt: 1704067200000 },
      { title: "B", createdAt: 1709251200000 },
    ];

    const result = sortByDate({
      items,
      config: {
        sortKey: "createdAt",
        order: "desc",
      },
    });

    expect(result.map((item) => item.title)).toEqual(["B", "A"]);
  });
});
