import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateTableLoadingCases } from './fixtures/gate-table/gateTableLoadingCases';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { snapshotGateTableCase } from './fixtures/gate-table/snapshotGateTableCase/snapshotGateTableCase';

// filid:contract settle-gate-table-loading
describe('gate table load and reset observations', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'load/reset fixture %i',
    async (index) => {
      const fixture = gateTableLoadingCases[index];
      const previousWheel = gateWheelEvaluation.mode;
      const previousTable = gateSelectionTable.mode;
      try {
        gateWheelEvaluation.mode = 'skip';
        gateSelectionTable.mode = 'verify';
        const actual = await observeGateTableModes(fixture);
        expect(gateSelectionTable.violations).toBe(0);
        const history = JSON.parse(actual);
        for (const observation of history.observations)
          expect(observation.failure, fixture.name).toEqual({
            $undefined: true,
          });
        if (fixture.name === 'load initial output and default propagation')
          expect(
            history.surface[0].find(
              ([key]: [string]) => key === 'changes',
            )?.[1],
          ).toEqual([
            [
              ['common', 'shared'],
              ['kind', 'a'],
              ['pa', 1],
            ],
          ]);
        if (
          fixture.name ===
            'load form reset preserves inactive explicit input' ||
          fixture.name ===
            'load reset default changes discriminator during transition'
        ) {
          const reset = history.observations[1];
          expect(
            reset.nodes.find(({ path }: { path: string }) => path === '').emit,
          ).toEqual({
            common: 'shared',
            kind: 'b',
            pb: 2,
          });
          expect(
            reset.extra.selections.some(
              ({ pendingExits }: { pendingExits: string[] }) =>
                pendingExits.includes('["/pa","number"]'),
            ),
          ).toBe(true);
          expect(reset.extra.commits[0].kind).toBe('load');
        }
        if (
          fixture.name ===
          'load discriminator subtree reset retains its mount source'
        )
          expect(
            history.observations[2].nodes.find(
              ({ path }: { path: string }) => path === '',
            ).emit,
          ).toEqual({
            common: 'shared',
            kind: 'a',
            pa: 1,
          });
        if (index === 12) {
          const expected = JSON.parse(
            readFileSync(
              new URL('./fixtures/gate-table/loading-12.json', import.meta.url),
              'utf8',
            ),
          );
          // 400C-03: Preserve the golden's full surface and node data; only private visit order/count may shrink.
          expect({ ...history, observations: undefined }).toEqual({
            ...expected,
            observations: undefined,
          });
          expect(history.observations).toHaveLength(
            expected.observations.length,
          );
          for (
            let position = 0;
            position < history.observations.length;
            position++
          ) {
            const observation = history.observations[position];
            const baseline = expected.observations[position];
            const visits: string[] = observation.visits;
            const previousVisits: string[] = baseline.visits;
            expect(
              visits.filter((path, i) => visits.indexOf(path) === i).sort(),
            ).toEqual(
              previousVisits
                .filter((path, i) => previousVisits.indexOf(path) === i)
                .sort(),
            );
            expect(visits.length).toBeLessThanOrEqual(previousVisits.length);
            expect({ ...observation, visits: undefined }).toEqual({
              ...baseline,
              visits: undefined,
            });
          }
          return;
        }
        await snapshotGateTableCase(
          'loading-' + gateTableLoadingCases.indexOf(fixture),
          actual,
        );
      } finally {
        gateWheelEvaluation.mode = previousWheel;
        gateSelectionTable.mode = previousTable;
      }
    },
  );
});
