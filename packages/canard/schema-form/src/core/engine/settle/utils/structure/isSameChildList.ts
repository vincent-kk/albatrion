import type { Nullable, Optional } from '@aileron/declare';

/**
 * Tell whether a freshly selected child list repeats a host's published list.
 * @param published - Host's current `children` array, null or absent before its first selection
 * @param selected - Child list the selection just built
 * @returns True when both lists hold the same nodes in the same order, so the published array can stay
 */
export const isSameChildList = <Child>(
  published: Optional<Nullable<readonly Child[]>>,
  selected: readonly Child[],
): published is readonly Child[] => {
  if (published?.length !== selected.length) return false;
  for (let index = 0; index < selected.length; index++)
    if (published[index] !== selected[index]) return false;
  return true;
};
