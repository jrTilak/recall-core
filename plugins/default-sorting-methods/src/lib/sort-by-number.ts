import type { SortArgs } from "./types";

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;

  if (typeof value === "string") {
    if (value.trim() === "") return Number.NaN;

    const number = Number(value);
    return Number.isFinite(number) ? number : Number.NaN;
  }

  return Number.NaN;
};

/**
 * Sorts items by number and returns a new array.
 *
 * Does not mutate original array.
 * Invalid or missing numbers go to the end.
 */
export const sortByNumber = <
  T extends Record<string, unknown>,
  K extends keyof T
>({
  items,
  config,
}: SortArgs<T, K>): T[] => {
  const { sortKey, order } = config;
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const numA = toNumber(a[sortKey]);
    const numB = toNumber(b[sortKey]);

    const invalidA = Number.isNaN(numA);
    const invalidB = Number.isNaN(numB);

    if (invalidA && invalidB) return 0;
    if (invalidA) return 1;
    if (invalidB) return -1;

    return (numA - numB) * direction;
  });
};
