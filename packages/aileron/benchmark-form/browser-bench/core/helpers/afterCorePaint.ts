/**
 * Cross a paint opportunity using the browser-owned animation frame queue.
 * @returns A promise resolved on the second animation frame.
 */
export function afterCorePaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}
