import { SORTING_METHODS } from "./lib";

export const run = (ctx: any) => {
  ctx.options.sortingMethods.add({
    methods: SORTING_METHODS,
  });
};
