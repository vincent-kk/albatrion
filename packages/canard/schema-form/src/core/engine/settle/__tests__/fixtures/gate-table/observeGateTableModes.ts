import { fileURLToPath } from 'node:url';
import { expect, vi } from 'vitest';

import { engineModes } from '../../../../utils/cache/engineModes';
import { getGateSelectionTable } from '../../../utils/compute/childSelection/getGateSelectionTable';
import * as entrySelection from '../../../utils/compute/childSelection/selectEntryStep';
import type { gateSelectionCases } from '../gateSelectionCases';
import { classifyGateTableVisits } from './classifyGateTableVisits';
import { observeGateTableCase } from './observeGateTableCase';
import { sectionGateTableObservation } from './snapshotGateTableCase/utils/sectionGateTableObservation';

/**
 * Compare every stored field in three modes and prove that omitted calls are table steps.
 * @param fixture - History whose off execution remains the stored baseline
 * @param compactSchemas - Hash only record schemas for large bulk histories;
 * all selection, delivery, shape-dirty and verify comparisons remain unchanged
 * @returns Off serialization for the unchanged file snapshot assertion
 */
export const observeGateTableModes = async (
  fixture: (typeof gateSelectionCases)[number],
  compactSchemas = false,
): Promise<string> => {
  const previous = engineModes.gateSelection;
  const previousWheel = engineModes.gateWheel;
  let reference = '';
  const original = entrySelection.selectEntryStep;
  const classification = classifyGateTableVisits();
  try {
    for (const wheel of [previousWheel, 'skip'] as const) {
      classification.reset();
      engineModes.setMode('gateWheel', wheel);
      const histories: string[] = [];
      const visits: { path: string; table: boolean }[][] = [];
      for (const mode of ['off', 'table', 'verify'] as const) {
        engineModes.setMode('gateSelection', mode);
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
          classification.begin();
          histories.push(observeGateTableCase(fixture, compactSchemas));
          classification.complete();
          visits.push(calls);
        } finally {
          spy.mockRestore();
        }
      }
      const baseline = sectionGateTableObservation(histories[0]).sections;
      classification.normalize(baseline, 0);
      for (let mode = 1; mode < histories.length; mode++) {
        const actual = sectionGateTableObservation(histories[mode]).sections;
        classification.normalize(actual, mode);
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
    classification.restore();
    engineModes.setMode('gateSelection', previous);
    engineModes.setMode('gateWheel', previousWheel);
  }
};
