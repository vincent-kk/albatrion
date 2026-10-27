import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import * as visits from '../utils/compute/childSelection/gateSelection/getTableVisitSteps';
import { selectChildren } from '../utils/compute/childSelection/selectChildren';
import * as steps from '../utils/compute/childSelection/selectEntryStep';
import { selectNodeSchema } from '../utils/compute/selectNodeSchema';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { prepareGateTableRound } from '../utils/gates/prepareGateTableRound';
import * as reading from '../utils/gates/readGateSelectionGroup';
import { updatePendingExitIndex } from '../utils/scratch/updatePendingExitIndex';
import { gateTableScene } from './fixtures/gateTableScene';

const previousMode = engineModes.gateSelection;
const previous = { ...gateSelectionTable };
const previousWheel = engineModes.gateWheel;
beforeEach(() => {
  engineModes.setMode('gateWheel', 'skip');
});
afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(gateSelectionTable, previous);
  engineModes.setMode('gateSelection', previousMode);
  engineModes.setMode('gateWheel', previousWheel);
});

// filid:contract settle-gate-table-mutations
describe('named decision-62 mutation witnesses', () => {
  it('V1 requires the root group read before the first child step computation', () => {
    engineModes.setMode('gateSelection', 'table');
    const { root, context } = gateTableScene();
    context.dirtyPaths.add('/common');
    const events: string[] = [];
    const read = reading.readGateSelectionGroup;
    const select = steps.selectEntryStep;
    vi.spyOn(reading, 'readGateSelectionGroup').mockImplementation(
      (...args) => {
        events.push('read');
        return read(...args);
      },
    );
    vi.spyOn(steps, 'selectEntryStep').mockImplementation((...args) => {
      events.push('step');
      return select(...args);
    });
    prepareGateTableRound(root, context, 0);
    selectNodeSchema(root, context);
    selectChildren(
      root,
      context,
      root.structure!,
      () => events.push('compute'),
      true,
    );
    expect(events[0]).toBe('read');
    expect(events.indexOf('read')).toBeLessThan(events.indexOf('step'));
    expect(events.indexOf('compute')).toBeGreaterThan(events.indexOf('read'));
  });

  it('V2 removing R3 leaves a pending exit unvisited and violates S2′', () => {
    engineModes.setMode('gateSelection', 'verify');
    const { root, context } = gateTableScene();
    const child = root.structure!.a;
    context.pendingExits.set('["/a","string"]', child);
    updatePendingExitIndex(context, '/a', 1);
    delete root.structure!.a;
    root.structure!.kind.local = root.structure!.kind.emit = 'b';
    const get = visits.getTableVisitSteps;
    vi.spyOn(visits, 'getTableVisitSteps').mockImplementation((frame, table) =>
      get(frame, table).filter(
        (index) => table.plan.steps[index].entry.name !== 'a',
      ),
    );
    prepareGateTableRound(root, context, 0);
    const before = gateSelectionTable.violations;
    expect(() => selectChildren(root, context, {}, () => {}, true)).toThrow(
      'S2′',
    );
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('V3 removing R4 loses a dormant caller input and violates S2′', () => {
    engineModes.setMode('gateSelection', 'verify');
    const { root, context } = gateTableScene();
    delete root.structure!.a;
    root.structure!.kind.local = root.structure!.kind.emit = 'b';
    context.distributedInputs.set(root, {
      input: { a: 'dormant' },
      whole: false,
      automatic: false,
    });
    const get = visits.getTableVisitSteps;
    vi.spyOn(visits, 'getTableVisitSteps').mockImplementation((frame, table) =>
      get(frame, table).filter(
        (index) => table.plan.steps[index].entry.name !== 'a',
      ),
    );
    prepareGateTableRound(root, context, 0);
    const before = gateSelectionTable.violations;
    expect(() => selectChildren(root, context, {}, () => {}, true)).toThrow(
      'S2′',
    );
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('V2 retains the required pending-exit visit without a fault injection', () => {
    engineModes.setMode('gateSelection', 'verify');
    const { root, context } = gateTableScene();
    context.pendingExits.set('["/a","string"]', root.structure!.a);
    updatePendingExitIndex(context, '/a', 1);
    delete root.structure!.a;
    root.structure!.kind.raw =
      root.structure!.kind.local =
      root.structure!.kind.emit =
        'b';
    prepareGateTableRound(root, context, 0);
    expect(() =>
      selectChildren(root, context, {}, () => {}, true),
    ).not.toThrow();
  });

  it.each(['table', 'verify'] as const)(
    'V3 %s retains dormant distributed input without a fault injection',
    (mode) => {
      engineModes.setMode('gateSelection', mode);

      const { root, context } = gateTableScene();
      delete root.structure!.a;
      root.structure!.kind.raw =
        root.structure!.kind.local =
        root.structure!.kind.emit =
          'b';
      context.distributedInputs.set(root, {
        input: { a: 'dormant' },
        whole: false,
        automatic: false,
      });
      prepareGateTableRound(root, context, 0);
      selectChildren(root, context, {}, () => {}, true);
      expect(root.runtime.latentRaw.get('["/a","string"]')).toBe('dormant');
    },
  );
});
