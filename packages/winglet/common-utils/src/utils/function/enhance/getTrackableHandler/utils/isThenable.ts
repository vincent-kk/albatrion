/**
 * Detects the callable then property used by Promise resolution.
 * @param value - A lifecycle hook's returned value
 * @returns Whether Promise resolution must wait for the returned object or function
 */
export const isThenable = (value: unknown): value is PromiseLike<unknown> => {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  return typeof Reflect.get(value, 'then') === 'function';
};
