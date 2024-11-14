export const parseBoolean = (value: unknown): boolean | undefined =>
  value !== undefined ? Boolean(value) : undefined;
