/** Whether a value can merge by named keys without changing the host kind. */
export const isPlain = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
