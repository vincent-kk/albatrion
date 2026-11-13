import { isDeepStrictEqual } from 'node:util';

import { createWorkload } from './createWorkload.mjs';
import { measurePair } from './measurePair.mjs';

/**
 * Measure equal work from two independently loaded builds, failing before timing a mismatching case.
 * @param {object[]} builds Baseline and current scanner APIs, in that order.
 * @param {object[]} scenarios Deterministic named benchmark cases.
 * @param {object} settings Optional measurement settings passed to paired sampling.
 * @returns {Promise<object[]>} Fingerprints, medians and baseline/current ratios for every case.
 * @throws When either build visits a different node count or produces a different output size.
 */
export async function compareBuilds(builds, scenarios, settings) {
  const results = [];
  for (const scenario of scenarios) {
    const workloads = builds.map((build) => createWorkload(build, scenario));
    const fingerprints = await Promise.all(
      workloads.map((workload) => workload.fingerprint()),
    );
    if (!isDeepStrictEqual(fingerprints[0], fingerprints[1]))
      throw new Error(
        `Work mismatch ${scenario.name}: ${JSON.stringify(fingerprints)}`,
      );
    const timing = await measurePair(
      workloads,
      scenario.group === 'asyncNoop',
      settings,
    );
    results.push({
      name: scenario.name,
      group: scenario.group,
      ...fingerprints[0],
      ...timing,
      ratio: timing.baselineMs / timing.currentMs,
    });
  }
  return results;
}
