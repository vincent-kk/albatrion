import { fileURLToPath } from 'node:url';
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
export const observeGateTableModes = async (
  fixture: (typeof gateSelectionCases)[number],
): Promise<string> => {
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
          if (
            section !== 'visits' &&
            section !== 'registrations' &&
            section !== 'timeline'
          )
            expect(actual[section], fixture.name + '/' + section).toEqual(
              value,
            );
        const normalizedTimeline = (rows: unknown) =>
          (rows as Record<string, unknown>[][]).map((row) =>
            row.map((event) => {
              if (event.event !== 'registration') return event;
              const { dirty: _dirty, ...fixed } = event;
              return fixed;
            }),
          );
        expect(
          normalizedTimeline(actual.timeline),
          fixture.name + '/timeline except registration dirty',
        ).toEqual(normalizedTimeline(baseline.timeline));
        const shapes = (rows: unknown) =>
          (rows as { shapeDirty: string[] }[][]).map((row) =>
            row.map((entry) => [...entry.shapeDirty].sort()),
          );
        expect(
          shapes(actual.registrations),
          fixture.name + '/shape dirty after every registration',
        ).toEqual(shapes(baseline.registrations));
        if (mode === 2)
          expect(actual.registrations).toEqual(
            sectionGateTableObservation(histories[1]).sections.registrations,
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
      if (wheel === 'skip') {
        const registrations = sectionGateTableObservation(histories[1]).sections
          .registrations;
        const name = fixture.name
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/-$/, '');
        await expect(JSON.stringify(registrations) + '\n').toMatchFileSnapshot(
          fileURLToPath(
            new URL('./registration-pr3/' + name + '.json', import.meta.url),
          ),
        );
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
