import { summarizeGroups } from './summarizeGroups.mjs';

/**
 * Enforce every case's bounds and each requested group's geometric mean.
 * @param {object[]} cases Measured cases with positive finite baseline/current timing ratios.
 * @param {object} limits Optional minimum group ratios and maximum per-case slowdown/speedup factors.
 * @returns {object} Group geometric means for the report.
 * @throws When measurement data or any threshold is invalid or unmet.
 */
export function evaluateComparison(
  cases,
  { min = {}, maxSlowdown = Infinity, maxSpeedup = Infinity } = {},
) {
  if (!cases.length) throw new Error('No measured cases');
  const failures = [];
  for (const item of cases) {
    if (!Number.isFinite(item.ratio) || item.ratio <= 0)
      throw new Error(`Invalid ratio: ${item.name}`);
    if (item.ratio < 1 / maxSlowdown)
      failures.push(
        `${item.name}: slowdown ${1 / item.ratio} > ${maxSlowdown}`,
      );
    if (item.ratio > maxSpeedup)
      failures.push(`${item.name}: speedup ${item.ratio} > ${maxSpeedup}`);
  }
  const means = summarizeGroups(cases);
  for (const [group, minimum] of Object.entries(min)) {
    if (!Object.hasOwn(means, group))
      throw new Error(`Unknown group: ${group}`);
    if (means[group] < minimum)
      failures.push(`${group}: geometric mean ${means[group]} < ${minimum}`);
  }
  if (failures.length) throw new Error(failures.join('\n'));
  return means;
}
