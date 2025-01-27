export const isMap = <Key, Value>(value: unknown): value is Map<Key, Value> =>
  value instanceof Map;
