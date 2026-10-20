import { describe, expect, it, vi } from 'vitest';

import { getCommittedDeclarationKey } from '../../utils/controls/getCommittedDeclarationKey';
import * as predicate from '../utils/gates/canSkipGateWheel';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { gateWheelCases } from './fixtures/gateWheelCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

describe('gate-wheel input evidence at critical wheels', () => {
  it.each(['S3 late', 'S5 overlay'])(
    '%s executes the wheel after a changed projected read',
    (prefix) => {
      const fixture = gateWheelCases.find((item) =>
        item.name.startsWith(prefix),
      )!;
      const previousMode = gateWheelEvaluation.mode;
      const proving = vi.spyOn(predicate, 'canSkipGateWheel');
      const decisions: { round: number; allowed: boolean }[][] = [];
      const observations: {
        emit: unknown;
        declarations: readonly number[] | undefined;
      }[] = [];
      try {
        runGateSelectionCase(
          fixture,
          () => {
            gateWheelEvaluation.mode = 'skip';
          },
          (root) => {
            observations.push({
              emit: root.emit,
              declarations: root.runtime.committedDeclarationIds?.get(
                getCommittedDeclarationKey(root),
              ),
            });
            decisions.push(
              proving.mock.calls
                .filter(([node]) => node.path === '')
                .map((args) => ({
                  round: args[3],
                  allowed: proving.mock.results[
                    proving.mock.calls.indexOf(args)
                  ].value as boolean,
                })),
            );
            proving.mockClear();
          },
        );
        console.log(fixture.name, JSON.stringify(decisions));
        const critical = prefix.startsWith('S3')
          ? decisions.slice(-1)
          : decisions.slice(1, 2);
        for (const wheels of critical) {
          expect(wheels.length).toBeGreaterThan(0);
          expect(wheels[0]).toEqual({ round: 0, allowed: false });
        }
        const observation = prefix.startsWith('S3')
          ? observations[observations.length - 1]
          : observations[1];
        if (prefix.startsWith('S3')) {
          expect(observation.emit).toEqual({ mode: 'x', p: 'P', extra: 'on' });
          expect(observation.declarations).toEqual([0, 1, 2]);
        } else {
          expect(observation.emit).toEqual({ flag: true });
          expect(observation.declarations).toEqual([0, 2]);
        }
      } finally {
        proving.mockRestore();
        gateWheelEvaluation.mode = previousMode;
      }
    },
  );

  it.each([5, 20, 80])(
    'S2 nested oneOf-%i keeps its complete frame through child recursion',
    (count) => {
      const fixture = gateWheelCases.find(
        (item) => item.name === `S2 oneOf-${count}, nested=true`,
      )!;
      const previousMode = gateWheelEvaluation.mode;
      const proving = vi.spyOn(predicate, 'canSkipGateWheel');
      try {
        runGateSelectionCase(fixture, () => {
          gateWheelEvaluation.mode = 'skip';
        });
        const frames = proving.mock.calls.filter(
          ([node]) => node.path === '/obj',
        );
        expect(frames.length).toBeGreaterThanOrEqual(3);
        for (let index = 0; index < frames.length; index++) {
          expect([...frames[index][2].inputs.keys()]).toEqual(['/obj/kind']);
          expect(
            proving.mock.results[proving.mock.calls.indexOf(frames[index])]
              .value,
          ).toBe(true);
          expect(
            frames
              .slice(0, index)
              .every((entry) => entry[2] !== frames[index][2]),
          ).toBe(true);
        }
      } finally {
        proving.mockRestore();
        gateWheelEvaluation.mode = previousMode;
      }
    },
  );

  it('S3 fixed-start closes both positively dependent declarations', () => {
    const fixture = gateWheelCases.find((item) =>
      item.name.startsWith('S3 fixed'),
    )!;
    const previousMode = gateWheelEvaluation.mode;
    const values: unknown[] = [];
    try {
      runGateSelectionCase(
        fixture,
        () => {
          gateWheelEvaluation.mode = 'skip';
        },
        (root) => {
          values.push(root.emit);
        },
      );
      expect(values[0]).toEqual({ mode: 'x', akey: true, bkey: true });
      expect(values[1]).toEqual({ mode: 'y' });
    } finally {
      gateWheelEvaluation.mode = previousMode;
    }
  });
});
