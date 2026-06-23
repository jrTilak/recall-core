import { naturalSort } from "./natural-sort";
import { sortByDate } from "./sort-by-date";
import { sortByNumber } from "./sort-by-number";
import type { SortOrder } from "./types";

type SortingMethod<T extends Record<string, unknown>> = {
  id: string;
  name: string;
  icon:string,
  shortName: string;
  defaultOrder: SortOrder;
  appliesWhen: {
    hasProperty: keyof T;
    scope: "*";
  };
  onSort: (data: readonly T[], sortOrder: SortOrder) => T[];
};

export const SORTING_METHODS: SortingMethod<Record<string, unknown>>[] = [
  {
    id: "sort-by-name",
    name: "Sort by Name",
    shortName: "Name",
    defaultOrder: "asc",
    icon: "ALargeSmall",
    appliesWhen: {
      hasProperty: "name",
      scope: "*",
    },
    onSort: (data, sortOrder) =>
      naturalSort({
        items: data,
        config: {
          sortKey: "name",
          order: sortOrder,
        },
      }),
  },
  {
    id: "sort-by-created-date",
    name: "Sort by Created Date",
    icon: "CalendarPlus",
    shortName: "Created",
    defaultOrder: "desc",
    appliesWhen: {
      hasProperty: "createdAt",
      scope: "*",
    },
    onSort: (data, sortOrder) =>
      sortByDate({
        items: data,
        config: {
          sortKey: "createdAt",
          order: sortOrder,
        },
      }),
  },
  {
    id: "sort-by-last-modified",
    name: "Sort by Last Modified",
    icon: "PencilLine",
    shortName: "Modified",
    defaultOrder: "desc",
    appliesWhen: {
      hasProperty: "updatedAt",
      scope: "*",
    },
    onSort: (data, sortOrder) =>
      sortByDate({
        items: data,
        config: {
          sortKey: "updatedAt",
          order: sortOrder,
        },
      }),
  },
  {
    id: "sort-by-custom-order",
    name: "Sort by Custom Order",
    icon: "ListOrdered",
    shortName: "Order",
    defaultOrder: "asc",
    appliesWhen: {
      hasProperty: "order",
      scope: "*",
    },
    onSort: (data, sortOrder) =>
      sortByNumber({
        items: data,
        config: {
          sortKey: "order",
          order: sortOrder,
        },
      }),
  },
];
