/**
 * Reports an isolated failure through the host runtime, which owns error delivery.
 * @param error - Original thrown value, preserved for host error observers
 * @returns Nothing; hosts without reportError receive a separate throwing timer task
 */
export const reportHostError = (error: unknown): void => {
  if (typeof globalThis.reportError === 'function') globalThis.reportError(error);
  else setTimeout(() => { throw error; }, 0);
};
