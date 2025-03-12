export const isMap = <T extends Map<any, any>>(value: unknown): value is T =>
  value instanceof Map;
