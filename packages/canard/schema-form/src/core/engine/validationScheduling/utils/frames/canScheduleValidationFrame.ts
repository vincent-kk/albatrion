// Frame APIs and visibility are host-owned; inspect them at each scheduling edge.
/** Whether this host can schedule and cancel a visible animation frame now.
 * @returns True only with both host frame APIs and a visible document. */
export const canScheduleValidationFrame = (): boolean =>
  typeof requestAnimationFrame === 'function' &&
  typeof cancelAnimationFrame === 'function' &&
  (typeof document === 'undefined' || !document.hidden);
