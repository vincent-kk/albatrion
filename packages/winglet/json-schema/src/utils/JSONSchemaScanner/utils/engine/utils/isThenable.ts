/**
 * Identify awaitable callback results only when the driver enables async callbacks.
 * @param value Callback result, including primitive and function values.
 * @returns Whether value exposes a callable then; propagates getter exceptions.
 */
export const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  typeof (value as { then?: unknown }).then === 'function';
