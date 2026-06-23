import type { SortArgs } from "./types";

type DateValue = string | number | Date | null | undefined;

const toTime = (value: DateValue): number => {
  if (value == null) return Number.NaN;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;

  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.NaN : time;
};

/**
 * Sorts items by date and returns a new array.
 *
 * Does not mutate original array.
 * Invalid or missing dates go to the end.
 */
export const sortByDate = <
  T extends Record<string, unknown>,
  K extends keyof T
>({
  items,
  config,
}: SortArgs<T, K>): T[] => {
  const { sortKey, order } = config;
  const direction = order === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const timeA = toTime(a[sortKey] as DateValue);
    const timeB = toTime(b[sortKey] as DateValue);

    const invalidA = Number.isNaN(timeA);
    const invalidB = Number.isNaN(timeB);

    if (invalidA && invalidB) return 0;
    if (invalidA) return 1;
    if (invalidB) return -1;

    return (timeA - timeB) * direction;
  });
};
