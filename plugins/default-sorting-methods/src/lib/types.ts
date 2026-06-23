
export type SortOrder = "asc" | "desc";

export type SortConfig<K extends PropertyKey> = {
  sortKey: K;
  order: SortOrder;
};

export type SortArgs<
  T extends Record<string, unknown>,
  K extends keyof T
> = {
  items: readonly T[];
  config: SortConfig<K>;
};
