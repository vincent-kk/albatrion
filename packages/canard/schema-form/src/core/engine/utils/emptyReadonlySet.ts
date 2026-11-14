import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

/** Read-only empty set facade; consumers can query but cannot mutate it. */
export const emptyReadonlySet: ReadonlySet<never> = Object.freeze({
  size: 0,
  has: () => false,
  forEach: () => undefined,
  entries: () => EMPTY_ARRAY.values(),
  keys: () => EMPTY_ARRAY.values(),
  values: () => EMPTY_ARRAY.values(),
  [Symbol.iterator]: () => EMPTY_ARRAY.values(),
});
