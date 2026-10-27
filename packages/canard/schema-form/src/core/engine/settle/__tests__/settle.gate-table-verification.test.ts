import { afterEach, describe, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { engineModes } from '../../utils/cache/engineModes';
import * as selection from '../utils/compute/childSelection/selectEntryStep';
import * as registration from '../utils/dependencies/registerRecalculation';
import * as supplementation from '../utils/dependencies/supplementSplitOwner';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import * as expressions from '../utils/gates/getGateExpression';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import * as reads from '../utils/gates/readProjectedValue';
import * as inputs from '../utils/gates/recordGateInput';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { gateTableScene } from './fixtures/gateTableScene';

const previousMode = engineModes.gateSelection;
const previous = { ...gateSelectionTable };
afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(gateSelectionTable, previous);
  engineModes.setMode('gateSelection', previousMode);
});

// filid:contract settle-gate-table-verification
describe('table invariants reject actual positional violations', () => {
  it('S3 rejects a shape path missing from the optimized registration', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const register = registration.registerRecalculation;
    vi.spyOn(registration, 'registerRecalculation').mockImplementation(
      (context) => {
        if (context.registrationShadow)
          context.registrationShadow.shape.add('/missing-shape');
        register(context);
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S3 shape dirty differs after registration');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S4 rejects an entering split owner that is no longer dirty', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const supplement = supplementation.supplementSplitOwner;
    vi.spyOn(supplementation, 'supplementSplitOwner').mockImplementation(
      (child, context) => {
        context.dirtyPaths.delete(child.path);
        supplement(child, context);
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S4 entry/revival must already be dirty');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S1 rejects a bucket verdict that differs from the authored expression', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const expression = expressions.getGateExpression;
    vi.spyOn(expressions, 'getGateExpression').mockImplementation((...args) => {
      const value = expression(...args);
      return value?.equality ? { ...value, evaluate: () => false } : value;
    });
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S1');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S2 rejects a changed value at the original skipped gate site', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const read = reads.readProjectedValue;
    let calls = 0;
    vi.spyOn(reads, 'readProjectedValue').mockImplementation(
      (context, path) => {
        const value = read(context, path);
        return path === '/kind' && ++calls > 1 ? 'mutated' : value;
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S2');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S2 rejects publication or a pendingOutputs change during a reread', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const read = reads.readProjectedValue;
    let calls = 0;
    vi.spyOn(reads, 'readProjectedValue').mockImplementation(
      (context, path) => {
        const value = read(context, path);
        if (path === '/kind' && ++calls > 1)
          (context.pendingOutputs ??= new Set()).add(root.structure!.kind);
        return value;
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S2');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S2 rejects even a transient dirty mark between original gate sites', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const select = selection.selectEntryStep;
    vi.spyOn(selection, 'selectEntryStep').mockImplementation(
      (entry, step, frame) => {
        frame.context.dirtyPaths.add('/kind');
        frame.context.dirtyPaths.delete('/kind');
        select(entry, step, frame);
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S2');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S5 rejects real witness inputs that differ from shadow full evaluation', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const record = inputs.recordGateInput;
    vi.spyOn(inputs, 'recordGateInput').mockImplementation(
      (context, path, value, kind) => {
        record(context, path, value, kind);
        if (path === '/kind') context.gateWheelFrame!.inputs.delete(path);
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S5');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S2 rejects a changed host registry occurrence count', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const registry = getGateRegistry(root.runtime);
    const count = registry.occurrenceCount(root.path);
    let reads = 0;
    vi.spyOn(registry, 'occurrenceCount').mockImplementation(
      () => count + (reads++ > 0 ? 1 : 0),
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S2');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });

  it('S5 rejects inconsistent real witness state despite equal input values', () => {
    const { root } = gateTableScene();
    engineModes.setMode('gateSelection', 'verify');
    const record = inputs.recordGateInput;
    vi.spyOn(inputs, 'recordGateInput').mockImplementation(
      (context, path, value, kind) => {
        record(context, path, value, kind);
        context.gateWheelFrame!.consistent = false;
      },
    );
    const before = gateSelectionTable.violations;
    expect(() =>
      writeFieldNode(root.structure!.kind, 'b', 'input', WriteOption.Overwrite),
    ).toThrow('S5');
    expect(gateSelectionTable.violations).toBe(before + 1);
  });
});
