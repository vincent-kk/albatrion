/** Deliver an unowned error through the host's reporter or cancellable browser error event. */
export const reportErrorToHost = (error: unknown): void => {
  if (typeof globalThis.reportError === 'function') {
    globalThis.reportError(error);
    return;
  }
  if (typeof window !== 'undefined' && typeof ErrorEvent === 'function') {
    const event = new ErrorEvent('error', {
      error,
      message: error instanceof Error ? error.message : String(error),
      cancelable: true,
    });
    if (!window.dispatchEvent(event)) return;
  }
  console.error(error);
};
