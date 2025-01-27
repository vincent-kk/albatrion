export const isWeakSet = <Key extends WeakKey>(
  value: unknown,
): value is WeakSet<Key> => value instanceof WeakSet;
