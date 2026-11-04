import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PlainNode } from '../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as buckets from '../utils/compute/childSelection/gateSelection/readGateBucket';
import * as selection from '../utils/compute/childSelection/selectChildren';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { gateWheelEvaluation } from '../utils/gates/gateWheelEvaluation';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createGatePredicateSchema } from './fixtures/createGatePredicateSchema';
import { observeGateTableModes } from './fixtures/gate-table/observeGateTableModes';
import { gateWheelCases } from './fixtures/gateWheelCases';
import { runGateSelectionCase } from './helpers/runGateSelectionCase';

/** Preserve the host harness's shipped or verification defaults. */
const modes = {
  predicate: engineModes.gatePredicate,
  wheel: engineModes.gateWheel,
  selection: engineModes.gateSelection,
};
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('gatePredicate', modes.predicate);
  engineModes.setMode('gateWheel', modes.wheel);
  engineModes.setMode('gateSelection', modes.selection);
});

// filid:contract gate-predicate
describe('gate predicate reference and shadow modes', () => {
  it('the extended visit classification still rejects a corrupted discriminator table', async () => {
    engineModes.setMode('gatePredicate', 'on');
    engineModes.setMode('gateWheel', 'shadow');
    vi.spyOn(buckets, 'readGateBucket').mockReturnValue([]);
    const violations = gateSelectionTable.violations;
    try {
      await expect(
        observeGateTableModes({
          name: 'B1 corrupted discriminator table',
          schema: createGatePredicateSchema('discriminator', 3),
          input: { kind: 'tag_0' },
          writes: [{ path: '/kind', value: 'tag_2' }],
        }),
      ).rejects.toThrow(
        /B1 corrupted discriminator table|S1 table step verdict/,
      );
      expect(gateSelectionTable.violations).toBeGreaterThan(violations);
    } finally {
      gateSelectionTable.violations = violations;
    }
  });
  it('the shipped narrowed S6 guard executes one wheel and skips one confirmation', () => {
    engineModes.setMode('gatePredicate', 'on');
    engineModes.setMode('gateWheel', 'skip');
    const fixture = gateWheelCases.find((entry) =>
      entry.name.startsWith('S6 validator'),
    )!;
    const selecting = vi.spyOn(selection, 'selectChildren');
    const counts: { wheels: number; skipped: number }[] = [];
    let skipped = gateWheelEvaluation.skipped;
    runGateSelectionCase(fixture, undefined, (root) => {
      counts.push({
        wheels: selecting.mock.calls.filter(([node]) => node === root).length,
        skipped: gateWheelEvaluation.skipped - skipped,
      });
      selecting.mockClear();
      skipped = gateWheelEvaluation.skipped;
    });
    expect(counts[1]).toEqual({ wheels: 1, skipped: 1 });
  });

  it.each(['not-ref', 'patternProperties'] as const)(
    '%s retains two wheels and no skipped confirmation',
    (kind) => {
      engineModes.setMode('gatePredicate', 'on');
      engineModes.setMode('gateWheel', 'skip');
      const fixture = gateWheelCases.find((entry) =>
        entry.name.startsWith('S6 validator'),
      )!;
      const condition =
        kind === 'not-ref'
          ? { not: { $ref: '#/$defs/rejected' } }
          : {
              patternProperties: { '^kind$': { const: 'x' } },
              required: ['kind'],
            };
      const selecting = vi.spyOn(selection, 'selectChildren');
      const counts: { wheels: number; skipped: number }[] = [];
      let skipped = gateWheelEvaluation.skipped;
      const schema = fixture.schema;
      if (!schema || typeof schema !== 'object')
        throw new Error('S6 requires an object schema');
      runGateSelectionCase(
        {
          ...fixture,
          schema: {
            ...schema,
            $defs: {
              rejected: {
                properties: { kind: { const: 'y' } },
                required: ['kind'],
              },
            },
            if: condition,
          },
        },
        undefined,
        (root) => {
          counts.push({
            wheels: selecting.mock.calls.filter(([node]) => node === root)
              .length,
            skipped: gateWheelEvaluation.skipped - skipped,
          });
          selecting.mockClear();
          skipped = gateWheelEvaluation.skipped;
        },
      );
      expect(counts[1]).toEqual({ wheels: 2, skipped: 0 });
    },
  );

  it('the full-input S6 reference retains two wheels and no skipped confirmation', () => {
    engineModes.setMode('gatePredicate', 'off');
    engineModes.setMode('gateWheel', 'skip');
    const fixture = gateWheelCases.find((entry) =>
      entry.name.startsWith('S6 validator'),
    )!;
    const selecting = vi.spyOn(selection, 'selectChildren');
    const counts: { wheels: number; skipped: number }[] = [];
    let skipped = gateWheelEvaluation.skipped;
    runGateSelectionCase(fixture, undefined, (root) => {
      counts.push({
        wheels: selecting.mock.calls.filter(([node]) => node === root).length,
        skipped: gateWheelEvaluation.skipped - skipped,
      });
      selecting.mockClear();
      skipped = gateWheelEvaluation.skipped;
    });
    expect(counts[1]).toEqual({ wheels: 2, skipped: 0 });
  });

  it.each(['active', 'if', 'discriminator'] as const)(
    '%s has the same selection with full-input reference and predicate shadow',
    (kind) => {
      const captures: unknown[][] = [];
      const failures = gateWheelEvaluation.nonNoop;
      for (const mode of ['off', 'on'] as const) {
        engineModes.setMode('gatePredicate', mode);
        engineModes.setMode('gateSelection', 'verify');
        engineModes.setMode('gateWheel', 'shadow');
        const { root } = createTestTree(createGatePredicateSchema(kind, 3));
        const snapshots: unknown[] = [];
        loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
        snapshots.push({
          value: root.emit,
          keys: Object.keys(root.structure ?? {}),
        });
        for (const tag of ['tag_2', 'unknown', 'tag_0']) {
          writeFieldNode(
            root.structure!.kind,
            tag,
            'input',
            WriteOption.Overwrite,
          );
          snapshots.push({
            value: root.emit,
            keys: Object.keys(root.structure ?? {}),
          });
        }
        captures.push(snapshots);
      }
      expect(captures[1]).toEqual(captures[0]);
      expect(gateWheelEvaluation.nonNoop).toBe(failures);
    },
  );

  it('S6 selection agrees between the full-input reference and narrowed shadow', () => {
    const fixture = gateWheelCases.find((entry) =>
      entry.name.startsWith('S6 validator'),
    )!;
    const captures: unknown[][] = [];
    const confirmations = gateWheelEvaluation.confirmations;
    const failures = gateWheelEvaluation.nonNoop;
    for (const mode of ['off', 'on'] as const) {
      const snapshots: unknown[] = [];
      runGateSelectionCase(
        fixture,
        () => {
          engineModes.setMode('gatePredicate', mode);
          engineModes.setMode('gateSelection', 'verify');
          engineModes.setMode('gateWheel', 'shadow');
        },
        (root: PlainNode) => {
          snapshots.push({
            value: root.emit,
            keys: Object.keys(root.structure ?? {}),
          });
        },
      );
      captures.push(snapshots);
    }
    expect(captures[1]).toEqual(captures[0]);
    expect(gateWheelEvaluation.confirmations).toBeGreaterThan(confirmations);
    expect(gateWheelEvaluation.nonNoop).toBe(failures);
  });
});
