export const isSet = <T>(value: unknown): value is Set<T> =>
  value instanceof Set;
