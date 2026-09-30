import { describe, expect, it, vi } from 'vitest';

import { NodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('settle derivation', () => {
  it('SETTLE-046 load fires derived from the loaded source', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('SETTLE-048 no fire lets a caller value survive the same source', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.target, 'manual', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root, { source: 'A', target: 'manual' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });

  it('SETTLE-004 edge consumed does not reevaluate one source edge after its own write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'number' },
      target: { type: 'number', controls: { derived: '../source + 1' } },
    } });
    loadSchemaNodeAtMount(root, { source: 1 }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe(2);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('WRITE-028 load unset clears a true target but leaves its input', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: { unsetValue: '../clear' } },
    } });
    loadSchemaNodeAtMount(root, { clear: true, target: 'X' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBeUndefined();
    expect(root.structure?.clear?.raw).toBe(true);
  });

  it('WRITE-029 rebirth treats a newly active true unset rule as an edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      present: { type: 'boolean' },
      target: { type: 'string', default: 'D', controls: {
        active: '../present', unsetValue: 'true',
      } },
    } });
    loadSchemaNodeAtMount(root, { present: false }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.present, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.target).toBeDefined();
    expect(root.structure?.target?.raw).toBeUndefined();
  });

  it('WRITE-015 suppress derive consumes the load edge without an automatic write', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', target: 'manual' },
      SetValueOption.DisableAutomaticWrites);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root, { source: 'A', target: 'manual' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('B');
  });

  it('SETTLE-006 resetInteraction clears flags on a false to true edge', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: { resetInteraction: '../clear' } },
    } });
    loadSchemaNodeAtMount(root, { clear: false, target: 'X' }, SetValueOption.Overwrite);
    const target = root.structure!.target;
    target.state = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    const revision = target.revision;
    writeSchemaNode(root.structure!.clear, true, 'input', SetValueOption.Overwrite);
    expect(target.state[NodeState.Dirty]).toBe(false);
    expect(target.state[NodeState.Touched]).toBe(false);
    expect(target.revision).toBeGreaterThan(revision);
    expect(target.raw).toBe('X');
  });

  it('28C-04 suppressed resetInteraction still clears flags on a load', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      clear: { type: 'boolean' },
      target: { type: 'string', controls: {
        derived: '../clear ? "derived" : undefined',
        resetInteraction: '../clear',
      } },
    } });
    loadSchemaNodeAtMount(root, { clear: false, target: 'before' },
      SetValueOption.Overwrite);
    const target = root.structure!.target;
    target.state = { [NodeState.Dirty]: true, [NodeState.Touched]: true };
    writeSchemaNode(root, { clear: true, target: 'manual' }, 'load',
      SetValueOption.DisableAutomaticWrites);
    expect(root.structure?.target?.raw).toBe('manual');
    expect(root.structure?.target?.state[NodeState.Dirty]).toBe(false);
    expect(root.structure?.target?.state[NodeState.Touched]).toBe(false);
  });

  it('TEST-069 derive budget restores the original caller source B', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'number', controls: { derived: '../right + 1' } },
      right: { type: 'number', controls: { derived: '../left + 1' } },
    } });
    expect(() => loadSchemaNodeAtMount(root, { left: 0, right: 0 },
      SetValueOption.Overwrite)).toThrow('budget');
    expect(root.emit).toEqual({ left: 0, right: 0 });
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'budget', exceededBudget: 'derive', iterations: 25 });
    expect(root.runtime.settlementTrace?.budget).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'derived', sourcePath: '/left',
        targetPath: '/left' }),
    ]));
  });

  it('TEST-016 settle trace and 28C-01 trace slot keep only the last development commit', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: 'string', controls: { derived: '../source' } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    const first = root.runtime.settlementTrace;
    expect(first?.entry).toMatchObject({ api: 'load', option: SetValueOption.Overwrite });
    expect(first?.rounds[0]).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'derived', targetPath: '/target', result: 'applied' }),
    ]));
    writeSchemaNode(root.structure!.source, 'B', 'input', SetValueOption.Overwrite);
    expect(root.runtime.settlementTrace).not.toBe(first);
  });

  it('CONTROLS-073 children layer derives each named child from its parent host', () => {
    const { root } = createTestTree({ type: 'object', controls: {
      children: [{ targets: ['target'], controls: { derived: './source' } }],
    }, properties: {
      source: { type: 'string' }, target: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('CONTROLS-077 fragment derived uses the fragment host for each direct child', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
    }, allOf: [{ controls: { derived: './source' }, properties: {
      target: { type: 'string' },
    } }] });
    loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('A');
  });

  it('TEST-016 settle trace records a derived candidate that loses to unsetValue', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' }, clear: { type: 'boolean' },
      target: { type: 'string', controls: {
        derived: '../source', unsetValue: '../clear',
      } },
    } });
    loadSchemaNodeAtMount(root, { source: 'A', clear: true }, SetValueOption.Overwrite);
    const entries = root.runtime.settlementTrace?.rounds.flat() ?? [];
    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'derived', targetPath: '/target', result: 'lost' }),
      expect.objectContaining({ kind: 'unsetValue', targetPath: '/target', result: 'applied' }),
    ]));
  });

  it('TEST-016 settle trace withdraws a candidate outside the final shape', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' },
      flag: { type: 'boolean', controls: { derived: '../source === "on"' } },
      target: { type: 'string', controls: {
        active: '../flag', derived: '../source',
      } },
    } });
    loadSchemaNodeAtMount(root, { source: 'off', flag: true, target: 'old' },
      SetValueOption.Overwrite);
    expect(root.structure?.target).toBeUndefined();
    expect(root.runtime.settlementTrace?.rounds.flat()).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'derived', targetPath: '/target',
        result: 'withdrawn' }),
    ]));
  });

  it('28C-01 trace slot is absent in production settlements', () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const { root } = createTestTree({ type: 'object', properties: {
        source: { type: 'string' },
        target: { type: 'string', controls: { derived: '../source' } },
      } });
      loadSchemaNodeAtMount(root, { source: 'A' }, SetValueOption.Overwrite);
      expect(root.structure?.target?.raw).toBe('A');
      expect('settlementTrace' in root.runtime).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
