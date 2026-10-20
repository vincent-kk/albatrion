import { describe, expect, it, vi } from 'vitest';

import { FieldNodeEventType } from '@/schema-form/core/engine/record';
import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { setTestInteractionState } from './fixtures/setTestInteractionState';

// filid:contract settle-derive
describe('settle derivation', () => {
  it('SETTLE-046 load fires derived from the loaded source', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('SETTLE-048 no fire lets a caller value survive the same source', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.target,
      'manual',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { source: 'A', target: 'manual' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });

  it('SETTLE-004 edge consumed does not reevaluate one source edge after its own write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'number' },
        target: { type: 'number', controls: { derived: '../source + 1' } },
      },
    });
    loadFieldNodeAtMount(root, { source: 1 }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe(2);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('WRITE-028 load unset clears a true target but leaves its input', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        target: { type: 'string', controls: { unsetValue: '../clear' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { clear: true, target: 'X' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(root.structure?.clear?.raw).toBe(true);
  });

  it('WRITE-029 rebirth treats a newly active true unset rule as an edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        present: { type: 'boolean' },
        target: {
          type: 'string',
          default: 'D',
          controls: {
            active: '../present',
            unsetValue: 'true',
          },
        },
      },
    });
    loadFieldNodeAtMount(root, { present: false }, WriteOption.Overwrite);
    writeFieldNode(
      root.structure!.present,
      true,
      'input',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target).toBeDefined();
    expect(root.structure?.target?.raw).toBeUndefined();
  });

  it('WRITE-015 suppress derive consumes the load edge without an automatic write', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', target: 'manual' },
      WriteOption.DisableAutomaticWrites,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(
      root,
      { source: 'A', target: 'manual' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });

  it('SETTLE-006 resetInteraction clears flags on a false to true edge', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        target: { type: 'string', controls: { resetInteraction: '../clear' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { clear: false, target: 'X' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    setTestInteractionState(target, {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    });
    const revision = target.revisionLedger[FieldNodeEventType.UpdateState] ?? 0;
    writeFieldNode(root.structure!.clear, true, 'input', WriteOption.Overwrite);
    expect(target.interactionState[FieldNodeState.Dirty]).toBe(false);
    expect(target.interactionState[FieldNodeState.Touched]).toBe(false);
    expect(
      target.revisionLedger[FieldNodeEventType.UpdateState],
    ).toBeGreaterThan(revision);
    expect(target.raw).toBe('X');
  });

  it('28C-04 suppressed resetInteraction still clears flags on a load', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        clear: { type: 'boolean' },
        target: {
          type: 'string',
          controls: {
            derived: '../clear ? "derived" : undefined',
            resetInteraction: '../clear',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { clear: false, target: 'before' },
      WriteOption.Overwrite,
    );
    const target = root.structure!.target;
    setTestInteractionState(target, {
      [FieldNodeState.Dirty]: true,
      [FieldNodeState.Touched]: true,
    });
    writeFieldNode(
      root,
      { clear: true, target: 'manual' },
      'load',
      WriteOption.DisableAutomaticWrites,
    );
    expect(root.structure?.target?.raw).toBe('manual');
    expect(root.structure?.target?.interactionState[FieldNodeState.Dirty]).toBe(
      false,
    );
    expect(
      root.structure?.target?.interactionState[FieldNodeState.Touched],
    ).toBe(false);
  });

  it('TEST-069 derive budget restores the original caller source B', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: { type: 'number', controls: { derived: '../right + 1' } },
        right: { type: 'number', controls: { derived: '../left + 1' } },
      },
    });
    expect(() =>
      loadFieldNodeAtMount(root, { left: 0, right: 0 }, WriteOption.Overwrite),
    ).toThrow('budget');
    expect(root.emit).toEqual({ left: 0, right: 0 });
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'budget',
      exceededBudget: 'derive',
      iterations: 25,
    });
    expect(root.runtime.settlementTrace?.budget).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'derived',
          sourcePath: '/left',
          targetPath: '/left',
        }),
      ]),
    );
  });

  it('TEST-016 settle trace and 28C-01 trace slot keep only the last development commit', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    const first = root.runtime.settlementTrace;
    expect(first?.entry).toMatchObject({
      api: 'load',
      option: WriteOption.Overwrite,
    });
    expect(first?.rounds[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'derived',
          targetPath: '/target',
          result: 'applied',
        }),
      ]),
    );
    writeFieldNode(root.structure!.source, 'B', 'input', WriteOption.Overwrite);
    expect(root.runtime.settlementTrace).not.toBe(first);
  });

  it('CONTROLS-073 fields layer derives each named child from its parent host', () => {
    const { root } = createTestTree({
      type: 'object',
      controls: {
        fields: [{ targets: ['target'], controls: { derived: './source' } }],
      },
      properties: {
        source: { type: 'string' },
        target: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('CONTROLS-077 fragment derived uses the fragment host for each direct child', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
      },
      allOf: [
        {
          controls: { derived: './source' },
          properties: {
            target: { type: 'string' },
          },
        },
      ],
    });
    loadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('TEST-016 settle trace records a derived candidate that loses to unsetValue', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        clear: { type: 'boolean' },
        target: {
          type: 'string',
          controls: {
            derived: '../source',
            unsetValue: '../clear',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'A', clear: true },
      WriteOption.Overwrite,
    );
    const entries = root.runtime.settlementTrace?.rounds.flat() ?? [];
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'derived',
          targetPath: '/target',
          result: 'lost',
        }),
        expect.objectContaining({
          kind: 'unsetValue',
          targetPath: '/target',
          result: 'applied',
        }),
      ]),
    );
  });

  it('TEST-016 settle trace withdraws a candidate outside the final shape', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        source: { type: 'string' },
        flag: { type: 'boolean', controls: { derived: '../source === "on"' } },
        target: {
          type: 'string',
          controls: {
            active: '../flag',
            derived: '../source',
          },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { source: 'off', flag: true, target: 'old' },
      WriteOption.Overwrite,
    );
    expect(root.structure?.target).toBeUndefined();
    expect(root.runtime.settlementTrace?.rounds.flat()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'derived',
          targetPath: '/target',
          result: 'withdrawn',
        }),
      ]),
    );
  });

  it('28C-01 trace slot is absent in production settlements', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { createTestTree: freshCreateTestTree } = await import(
      '../../__tests__/fixtures/createTestTree'
    );
    const { loadFieldNodeAtMount: freshLoadFieldNodeAtMount } = await import(
      '../loadFieldNodeAtMount'
    );
    try {
      const { root } = freshCreateTestTree({
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string', controls: { derived: '../source' } },
        },
      });
      freshLoadFieldNodeAtMount(root, { source: 'A' }, WriteOption.Overwrite);
      expect(root.structure?.target?.raw).toBe('A');
      expect('settlementTrace' in root.runtime).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
