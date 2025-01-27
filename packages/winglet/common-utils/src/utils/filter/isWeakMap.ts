export const isWeakMap = <Key extends WeakKey, Value>(
  value: unknown,
): value is WeakMap<Key, Value> => value instanceof WeakMap;
