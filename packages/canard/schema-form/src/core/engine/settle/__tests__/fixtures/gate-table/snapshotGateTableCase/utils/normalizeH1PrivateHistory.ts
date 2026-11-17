import { readFileSync } from 'node:fs';
import { expect } from 'vitest';

// 8d5c5dba1, 2026-10-27: yarn workspace @canard/schema-form test --run --project verify-unit src/core/engine/settle/__tests__/h1-verify-probe.test.ts (scratch observer dump).
const witnesses: Record<
  string,
  { visits: string[][]; changedNodes: string[][][] }
> = JSON.parse(
  readFileSync(
    new URL('../fixtures/h1-private-histories.json', import.meta.url),
    'utf8',
  ),
);

/**
 * Validate approved H1 work reductions before restoring original private history order.
 * @param fixture - Original golden identity
 * @param serialized - Complete observation, with all public fields retained
 * @returns Only the approved visits and changedNodes order normalized for exact goldens
 */
export const normalizeH1PrivateHistory = (
  fixture: string,
  serialized: string,
): string => {
  const witness = witnesses[fixture];
  if (!witness) return serialized;
  const history = JSON.parse(serialized);
  expect(history.observations).toHaveLength(witness.visits.length);
  for (const [index, observation] of history.observations.entries()) {
    const baseline = witness.visits[index];
    const actual: string[] = observation.visits;
    expect(actual.length, fixture + '/visits upper bound').toBeLessThanOrEqual(
      baseline.length,
    );
    let cursor = 0;
    for (const visit of baseline) if (visit === actual[cursor]) cursor++;
    expect(cursor, fixture + '/visits subsequence').toBe(actual.length);
    observation.visits = baseline;
    expect(observation.extra.commits).toHaveLength(
      witness.changedNodes[index].length,
    );
    for (const [commitIndex, commit] of observation.extra.commits.entries()) {
      const changed = witness.changedNodes[index][commitIndex];
      expect(
        [...commit.changedNodes].sort(),
        fixture + '/changedNodes members',
      ).toEqual([...changed].sort());
      commit.changedNodes = changed;
    }
  }
  return JSON.stringify(history);
};
