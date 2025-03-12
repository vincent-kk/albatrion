export const isWeakMap = <T extends WeakMap<any, any>>(
  value: unknown,
): value is T => value instanceof WeakMap;
