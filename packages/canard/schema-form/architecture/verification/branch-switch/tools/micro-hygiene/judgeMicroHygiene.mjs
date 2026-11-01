/** Apply the hygiene plan after the original IV-1 estimators finish.
 * @param {object} evidence Recomputed quality, 22 protected rows, exchange, Welch and heap results.
 * @returns {object} Explicit reasons and adoption; no row regression can be exchanged away.
 */
export function judgeMicroHygiene(evidence) {
  const outsideWidthRegressions = evidence.rows
    .filter((row) => row.decision === 'regressed')
    .map((row) => row.row);
  return {
    outsideWidthRegressions,
    weightedExchange: evidence.exchange,
    regressions: evidence.regressions,
    heaps: evidence.heaps,
    deviceCompleted: evidence.deviceCompleted,
    adoptable:
      evidence.rows.length === 22 &&
      evidence.quality &&
      evidence.deviceCompleted &&
      outsideWidthRegressions.length === 0 &&
      evidence.exchange.totalUs <= 0 &&
      evidence.exchange.passed &&
      evidence.regressions.length === 0 &&
      evidence.heaps.every((heap) => heap.passed),
  };
}
