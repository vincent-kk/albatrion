import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

/** Read-only empty map facade; no native mutable map is exposed or allocated. */
export const emptyReadonlyMap: ReadonlyMap<never, never> = Object.freeze({
  size: 0,
  get: () => undefined,
  has: () => false,
  forEach: () => undefined,
  entries: () => EMPTY_ARRAY.values(),
  keys: () => EMPTY_ARRAY.values(),
  values: () => EMPTY_ARRAY.values(),
  [Symbol.iterator]: () => EMPTY_ARRAY.values(),
});
