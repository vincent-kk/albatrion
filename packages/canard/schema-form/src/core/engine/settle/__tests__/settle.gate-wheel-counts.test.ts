import { describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as selection from '../utils/compute/childSelection/selectChildren';
import * as gates from '../utils/gates/evaluateGate';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateWheelCases } from './fixtures/gateWheelCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

describe('gate-form-one-key confirmation wheel counts', () => {
  it.each([100, 1000])('S1 evaluates K=%i gates in one selection', (count) => {
    const previousMode = gateWheelEvaluation.mode;
    gateWheelEvaluation.mode = 'skip';
    const { root } = createTestTree({
      type: 'object',
      properties: {
        sw: { type: 'number' },
        ...Object.fromEntries(
          Array.from({ length: count }, (_, index) => [
            `p${index}`,
            { type: 'number', controls: { active: '../sw >= 0' } },
          ]),
        ),
      },
    });
    loadFieldNodeAtMount(root, { sw: 1 }, WriteOption.Overwrite);
    const selecting = vi.spyOn(selection, 'selectChildren');
    const evaluating = vi.spyOn(gates, 'evaluateGate');
    try {
      writeFieldNode(root.structure!.sw, 2, 'input', WriteOption.Overwrite);
      expect(selecting).toHaveBeenCalledTimes(1);
      expect(evaluating).toHaveBeenCalledTimes(count);
      expect(root.runtime.diagnostics.status).toBe('stable');
    } finally {
      selecting.mockRestore();
      evaluating.mockRestore();
      gateWheelEvaluation.mode = previousMode;
    }
  });

  it.each([5, 20, 80])(
    'S2 oneOf-%i halves write wheels and retains exact mode-specific gate counts',
    (count) => {
      const fixture = gateWheelCases.find(
        (item) => item.name === `S2 oneOf-${count}, nested=false`,
      )!;
      const previousMode = gateWheelEvaluation.mode;
      const selecting = vi.spyOn(selection, 'selectChildren');
      const evaluating = vi.spyOn(gates, 'evaluateGate');
      const run = (mode: typeof gateWheelEvaluation.mode) => {
        const measurements: { wheels: number; gates: number }[] = [];
        runGateSelectionCase(
          fixture,
          () => {
            gateWheelEvaluation.mode = mode;
          },
          () => {
            measurements.push({
              wheels: selecting.mock.calls.filter(([node]) => node.path === '')
                .length,
              gates: evaluating.mock.calls.length,
            });
            selecting.mockClear();
            evaluating.mockClear();
          },
        );
        return measurements;
      };
      try {
        const baseline = run('record');
        const candidate = run('skip');
        expect(candidate[0]).toEqual(baseline[0]);
        expect(baseline.slice(1)).toEqual([
          {
            wheels: 4,
            gates: gateSelectionTable.mode === 'off' ? 16 * count : 0,
          },
          {
            wheels: 2,
            gates: gateSelectionTable.mode === 'off' ? 8 * count : 0,
          },
        ]);
        expect(candidate.slice(1)).toEqual([
          {
            wheels: 2,
            gates: gateSelectionTable.mode === 'off' ? 8 * count : 0,
          },
          {
            wheels: 1,
            gates: gateSelectionTable.mode === 'off' ? 4 * count : 0,
          },
        ]);
      } finally {
        selecting.mockRestore();
        evaluating.mockRestore();
        gateWheelEvaluation.mode = previousMode;
      }
    },
  );

  it.each(['S4', 'S5 nested', 'S6 unrelated', 'S6 validator'])(
    '%s takes only the permitted host-wheel skip',
    (prefix) => {
      const fixture = gateWheelCases.find((item) =>
        item.name.startsWith(prefix),
      )!;
      const previousMode = gateWheelEvaluation.mode;
      const selecting = vi.spyOn(selection, 'selectChildren');
      const measurements: { wheels: number; skipped: number }[] = [];
      let previousSkips = gateWheelEvaluation.skipped;
      try {
        runGateSelectionCase(
          fixture,
          () => {
            gateWheelEvaluation.mode = 'skip';
          },
          () => {
            measurements.push({
              wheels: selecting.mock.calls.filter(([node]) => node.path === '')
                .length,
              skipped: gateWheelEvaluation.skipped - previousSkips,
            });
            selecting.mockClear();
            previousSkips = gateWheelEvaluation.skipped;
          },
        );
        expect(measurements[0].skipped).toBe(0);
        if (prefix.startsWith('S6')) {
          expect(measurements[1].skipped).toBe(0);
          expect(measurements[1].wheels).toBe(
            prefix.includes('unrelated') ? 0 : 2,
          );
        } else expect(measurements[1].skipped).toBeGreaterThan(0);
      } finally {
        selecting.mockRestore();
        gateWheelEvaluation.mode = previousMode;
      }
    },
  );

  it('an if gate with an undefined-only child can prove an identical confirmation', () => {
    const fixture = gateWheelCases.find((item) =>
      item.name.startsWith('S6 validator'),
    )!;
    const previousMode = gateWheelEvaluation.mode;
    const beforeSkips = gateWheelEvaluation.skipped;
    const beforeConfirmations = gateWheelEvaluation.confirmations;
    try {
      const emptyChild = { ...fixture, input: { kind: 'y' } };
      runGateSelectionCase(emptyChild, () => {
        gateWheelEvaluation.mode = 'skip';
      });
      expect(gateWheelEvaluation.skipped - beforeSkips).toBe(1);
      runGateSelectionCase(emptyChild, () => {
        gateWheelEvaluation.mode = 'shadow';
      });
      expect(gateWheelEvaluation.confirmations - beforeConfirmations).toBe(1);
      expect(gateWheelEvaluation.nonNoop).toBe(0);
    } finally {
      gateWheelEvaluation.mode = previousMode;
    }
  });
});
