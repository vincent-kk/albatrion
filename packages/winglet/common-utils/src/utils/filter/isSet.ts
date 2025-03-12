export const isSet = <T extends Set<any>>(value: unknown): value is T =>
  value instanceof Set;
