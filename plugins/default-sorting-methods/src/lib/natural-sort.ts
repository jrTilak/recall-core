import type { SortArgs } from "./types";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const toStringValue = (value: unknown): string => {
  if (value == null) return "";
  return String(value);
};

/**
 * Sorts items naturally using Intl.Collator.
 *
 * Does not mutate original array.
 * Example: file1, file2, file10
 */
export const naturalSort = <
  T extends Record<string, unknown>,
  K extends keyof T
>({
  items,
  config,
}: SortArgs<T, K>): T[] => {
  const { sortKey, order } = config;
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    return (
      collator.compare(
        toStringValue(a[sortKey]),
        toStringValue(b[sortKey])
      ) * direction
    );
  });
};
