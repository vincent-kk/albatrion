/**
 * Expose an ownerless failure once through the browser or server sink.
 * @param error - Original failure or completed aggregate
 * @returns Nothing; the selected host sink owns the exposure
 */
export const reportOwnerlessError = (error: unknown): void => {
  if (typeof window !== 'undefined') {
    if ('reportError' in window && typeof window.reportError === 'function') {
      window.reportError(error);
      return;
    }
    if (typeof ErrorEvent !== 'undefined') {
      if (!window.dispatchEvent(new ErrorEvent('error', { error, message: String(error) })))
        return;
    }
  }
  console.error(error);
};
