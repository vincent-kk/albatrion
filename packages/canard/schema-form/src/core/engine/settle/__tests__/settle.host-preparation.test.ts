import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { FieldNodeWriteKind, WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { engineModes } from '../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as budget from '../utils/gates/getGateBudgetCap';
import * as expressions from '../utils/gates/getGateExpression';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { writeFieldNode } from '../utils/write/writeFieldNode';

/** Gated host with fixed siblings and one fresh payload per admitted branch. */
const createHost = (siblings: number, branches = 2) => {
  const tree = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'number', default: 0 },
      ...Object.fromEntries(
        Array.from({ length: siblings }, (_, index) => [
          `fixed_${index}`,
          { type: 'string', default: `fixed_${index}` },
        ]),
      ),
    },
    oneOf: Array.from({ length: branches }, (_, index) => ({
      controls: { active: `./kind === ${index}` },
      properties: { [`payload_${index}`]: { type: 'number', default: index } },
    })),
  });
  loadFieldNodeAtMount(tree.root, {}, WriteOption.Overwrite);
  return tree;
};

// filid:contract settle-b2-p2-wheel-static-cost
describe('host lifetime preparation', () => {
  const initialModes = {
    wheel: engineModes.gateWheel,
    selection: engineModes.gateSelection,
  };
  beforeEach(() => {
    engineModes.setMode('gateWheel', 'skip');
    engineModes.setMode('gateSelection', 'table');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    engineModes.setMode('gateWheel', initialModes.wheel);
    engineModes.setMode('gateSelection', initialModes.selection);
  });

  it('keeps an absent relocation list by identity without root bucket copies', () => {
    const { root } = createHost(0, 80);
    const registry = getGateRegistry(root.runtime);
    const first = registry.relocatedOccurrences('');
    expect(first).toHaveLength(0);
    expect(registry.relocatedOccurrences('')).toBe(first);
  });

  it('does not recheck gate expressions or budget membership on repeated writes', () => {
    const { root } = createHost(0, 80);
    writeFieldNode(
      root.childrenByName!.kind,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    const caps = vi.spyOn(budget, 'getHostWheelBudgetCap');
    const reads = vi.spyOn(expressions, 'getGateExpression');
    writeFieldNode(
      root.childrenByName!.kind,
      2,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.childrenByName!.kind,
      3,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(caps).not.toHaveBeenCalled();
    expect(reads.mock.calls.length).toBeLessThanOrEqual(2);
    expect(root.childrenByName!.payload_3.source).toBe(3);
    expect(root.childrenByName!.payload_2).toBeUndefined();
  });

  it.each([0, 100, 1000])(
    'does not republish static declaration IDs with %i fixed siblings',
    (siblings) => {
      const { root } = createHost(siblings);
      writeFieldNode(
        root.childrenByName!.kind,
        1,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      const fixed = root.childrenByName!.kind;
      const original = Map.prototype.set;
      let publications = 0;
      const sets = vi.spyOn(Map.prototype, 'set').mockImplementation(function (
        this: Map<unknown, unknown>,
        key,
        value,
      ) {
        if (key === fixed && Array.isArray(value)) publications++;
        return original.call(this, key, value);
      });
      try {
        writeFieldNode(
          fixed,
          0,
          FieldNodeWriteKind.Input,
          WriteOption.Overwrite,
        );
      } finally {
        sets.mockRestore();
      }
      expect(publications).toBe(0);
      expect(root.childrenByName!.kind).toBe(fixed);
      expect(root.childrenByName!.payload_0.source).toBe(0);
    },
  );

  it('keeps previously published children, childrenByName and value unchanged', () => {
    const { root } = createHost(100);
    writeFieldNode(
      root.childrenByName!.kind,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    const childrenByName = root.childrenByName!;
    const children = root.children!;
    const outputValue = root.storedOutputValue;
    const names = Object.keys(childrenByName);
    const previousChildren = [...children];
    const previousOutputValue = { ...(outputValue as object) };
    writeFieldNode(
      root.childrenByName!.kind,
      0,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(Object.keys(childrenByName)).toEqual(names);
    expect(children).toEqual(previousChildren);
    expect(outputValue).toEqual(previousOutputValue);
    expect(root.childrenByName).not.toBe(childrenByName);
  });

  it('discards static occurrence preparation on load and prepares a fresh witness', () => {
    const { root } = createHost(4);
    writeFieldNode(
      root.childrenByName!.kind,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    const previous = Reflect.get(getHostDerived(root), 'preparedStaticHost');
    expect(previous).toBeDefined();
    writeFieldNode(
      root,
      { kind: 0 },
      FieldNodeWriteKind.Load,
      WriteOption.Overwrite,
    );
    expect(
      Reflect.get(getHostDerived(root), 'preparedStaticHost'),
    ).toBeUndefined();
    writeFieldNode(
      root.childrenByName!.kind,
      1,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(Reflect.get(getHostDerived(root), 'preparedStaticHost')).not.toBe(
      previous,
    );
  });

  it('checks independent static witnesses in verification mode', () => {
    const mode = engineModes.gateSelection;
    engineModes.setMode('gateSelection', 'verify');
    try {
      const { root } = createHost(4);
      writeFieldNode(
        root.childrenByName!.kind,
        1,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      const prepared = Reflect.get(getHostDerived(root), 'preparedStaticHost');
      expect(prepared).toBeDefined();
      root.childrenByName!.fixed_0.isDetached = true;
      expect(() =>
        writeFieldNode(
          root.childrenByName!.kind,
          0,
          FieldNodeWriteKind.Input,
          WriteOption.Overwrite,
        ),
      ).toThrow(/static.*witness/i);
    } finally {
      engineModes.setMode('gateSelection', mode);
    }
  });
});
