import { expect, vi } from 'vitest';

import { getGateSelectionTable } from '../../../utils/compute/childSelection/getGateSelectionTable';
import * as entrySelection from '../../../utils/compute/childSelection/selectEntryStep';
import { gateSelectionTable } from '../../../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../../../utils/gates/gateWheelEvaluation';
import type { gateSelectionCases } from '../gateSelectionCases';
import { observeGateTableCase } from './observeGateTableCase';
import { sectionGateTableObservation } from './snapshotGateTableCase/utils/sectionGateTableObservation';

/**
 * Compare every stored field in three modes and prove that omitted calls are table steps.
 * @param fixture - History whose off execution remains the stored baseline
 * @returns Off serialization for the unchanged file snapshot assertion
 */
export const observeGateTableModes = (
  fixture: (typeof gateSelectionCases)[number],
): string => {
  const previous = gateSelectionTable.mode;
  const previousWheel = gateWheelEvaluation.mode;
  let reference = '';
  const original = entrySelection.selectEntryStep;
  try {
    for (const wheel of [previousWheel, 'skip'] as const) {
      gateWheelEvaluation.mode = wheel;
      const histories: string[] = [];
      const visits: { path: string; table: boolean }[][] = [];
      for (const mode of ['off', 'table', 'verify'] as const) {
        gateSelectionTable.mode = mode;
        const calls: { path: string; table: boolean }[] = [];
        const spy = vi
          .spyOn(entrySelection, 'selectEntryStep')
          .mockImplementation((entry, step, frame) => {
            const table =
              step &&
              getGateSelectionTable(
                frame.node.blueprintNode,
                frame.node.runtime.blueprint,
              );
            calls.push({
              path: frame.node.path + '/' + entry.name,
              table: !!table?.tableSteps.has(
                table.stepIndexByName.get(entry.name)!,
              ),
            });
            original(entry, step, frame);
          });
        try {
          histories.push(observeGateTableCase(fixture));
          visits.push(calls);
        } finally {
          spy.mockRestore();
        }
      }
      const baseline = sectionGateTableObservation(histories[0]).sections;
      for (let mode = 1; mode < histories.length; mode++) {
        const actual = sectionGateTableObservation(histories[mode]).sections;
        for (const [section, value] of Object.entries(baseline))
          if (section !== 'visits')
            expect(actual[section], fixture.name + '/' + section).toEqual(
              value,
            );
        expect(actual.visits, fixture.name + '/non-table visits').toEqual(
          baseline.visits,
        );
        expect(visits[mode].filter((visit) => !visit.table)).toEqual(
          visits[0].filter((visit) => !visit.table),
        );
        let cursor = 0;
        for (const visit of visits[0]) {
          if (visits[mode][cursor]?.path === visit.path) cursor++;
          else
            expect(
              visit.table,
              'only table steps may be unvisited: ' + visit.path,
            ).toBe(true);
        }
        expect(cursor).toBe(visits[mode].length);
      }
      if (!reference) reference = histories[0];
      if (wheel === 'skip')
        console.log(
          'GATE_TABLE_VISITS',
          JSON.stringify({
            fixture: fixture.name,
            counts: visits.map((calls) => calls.length),
            nonTable: visits.map(
              (calls) => calls.filter((call) => !call.table).length,
            ),
          }),
        );
    }
    return reference;
  } finally {
    gateSelectionTable.mode = previous;
    gateWheelEvaluation.mode = previousWheel;
  }
};
