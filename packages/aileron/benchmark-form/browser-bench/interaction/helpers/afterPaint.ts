/**
 * Wait for the browser to cross a paint opportunity after the caller's work.
 * @returns A double-rAF promise owned by the browser runtime
 */
export function afterPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}
