/**
 * Check that summary cadence explicitly matches every accepted variant's sample evidence.
 * @param {object} summary - Summary cases with their accepted attempt and frames distributions.
 * @param {object} samples - Measurements grouped by case, attempt and variant.
 * @returns {string[]} Missing or inconsistent nominal-period declarations.
 */
export function checkCoreSummaryCadence(summary, samples) {
  const problems = [];
  for (const row of summary.cases) {
    const group = samples[row.id]?.find(
      (entry) => entry.attempt === row.attempt,
    );
    if (!group) {
      problems.push(`${row.id}: no accepted sample group for summary cadence`);
      continue;
    }
    for (const [variant, measurements] of Object.entries(group.samples)) {
      if (!measurements.length) continue;
      const periods = measurements.map(
        ({ metrics }) => metrics.frameIntervalNominalMs,
      );
      const expected = periods
        .filter((period, index) => periods.indexOf(period) === index)
        .sort((a, b) => a - b);
      if (
        JSON.stringify(row.frames?.[variant]?.frameIntervalNominalMs) !==
        JSON.stringify(expected)
      )
        problems.push(
          `${row.id} ${variant}: summary frameIntervalNominalMs disagrees with samples`,
        );
    }
  }
  return problems;
}
