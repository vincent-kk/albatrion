/** Exact smoke workloads covering the primary cases and remaining browser paths. */
const PROFILES = {
  required: {
    runs: 2,
    cases: [
      'mount-flat-500-validate',
      'mount-flat-500-none',
      'mount-array-1000-validate',
      'type-flat-500-validate-nonburst',
      'first-key-flat-500-validate',
      'first-key-flat-500-validate-after-load',
    ],
  },
  remaining: {
    runs: 1,
    cases: [
      'mount-if-flat-500-none',
      'mount-if-flat-500-validate',
      'mount-nested-d5-f4-validate',
      'type-array-1000-validate-nonburst',
    ],
  },
};

/**
 * Validate exact case membership and run counts for an explicitly named smoke workload.
 * @param {object} summary - Summary with its runs, warmup and case identifiers.
 * @param {object} samples - Raw case groups whose keys must match the same workload.
 * @param {string} name - Required six-case smoke by default; remaining selects the four complementary browser cases.
 * @returns {{ runs: number, problems: string[] }} Expected per-variant sample count and metadata failures; unknown names throw.
 */
export function checkCoreSmokeProfile(summary, samples, name = 'required') {
  if (!Object.hasOwn(PROFILES, name))
    throw new Error(`Unknown smoke profile: ${name}`);
  const profile = PROFILES[name];
  const problems = [];
  if (summary.runs !== profile.runs || summary.warmup !== 1)
    problems.push(`smoke (${name}) requires runs ${profile.runs} and warmup 1`);
  for (const ids of [Object.keys(samples), summary.cases.map((row) => row.id)])
    if (
      ids.length !== profile.cases.length ||
      profile.cases.some((id) => !ids.includes(id))
    )
      problems.push(
        `smoke (${name}) case set must match its ${profile.cases.length} required cases`,
      );
  return { runs: profile.runs, problems };
}
