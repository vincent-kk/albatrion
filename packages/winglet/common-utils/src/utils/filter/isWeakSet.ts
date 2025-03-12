export const isWeakSet = <T extends WeakSet<any>>(value: unknown): value is T =>
  value instanceof WeakSet;
