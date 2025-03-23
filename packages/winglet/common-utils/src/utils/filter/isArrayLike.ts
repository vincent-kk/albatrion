export const isArrayLike = (value: unknown): value is ArrayLike<unknown> =>
  value !== null &&
  typeof value === 'object' &&
  'length' in value &&
  typeof value.length === 'number' &&
  (value.length === 0 || value.length - 1 in value);
