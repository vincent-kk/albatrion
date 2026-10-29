import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { FieldNodeEventType } from '../../record';
import { WriteOption } from '../../types/value';
import * as declarationKeys from '../../utils/controls/getCommittedDeclarationKey';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import * as requiredChildren from '../utils/commit/utils/getRequiredChildren';
import { getControlLayers } from '../utils/controls/getControlLayers';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { readDefault } from '../utils/transition/readDefault';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-static-commit
it('does not revisit 1000 retained required flags and bounds declaration-key work', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      type: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number', default: index },
        ]),
      ),
    },
    oneOf: ['a', 'b'].map((type) => ({
      controls: { active: `./type === "${type}"` },
      properties: { x: { type: 'string', default: type } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.type, 'b', 'input', WriteOption.Overwrite);
  let requiredReads = 0;
  for (let index = 0; index < 1000; index++) {
    const child = root.structure![`pad_${index}`];
    let required = child.required;
    Object.defineProperty(child, 'required', {
      configurable: true,
      enumerable: true,
      get() {
        requiredReads++;
        return required;
      },
      set(value: boolean) {
        required = value;
      },
    });
  }
  const keys = vi.spyOn(declarationKeys, 'getCommittedDeclarationKey');
  writeFieldNode(root.structure!.type, 'a', 'input', WriteOption.Overwrite);
  expect(requiredReads).toBe(0);
  expect(keys.mock.calls.length).toBeLessThanOrEqual(16);
});

it('reads static control and default declarations without a committed-key lookup', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'boolean', default: false },
      fixed: { type: 'number', default: 7, controls: { readOnly: '../kind' } },
    },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const get = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
  const fixed = root.structure!.fixed;
  expect(getControlLayers(fixed, new Map()).length).toBeGreaterThan(0);
  expect(readDefault(fixed, new Map())).toBe(7);
  expect(get).not.toHaveBeenCalled();
});

it('updates existing required flags when branch required identities differ', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { shared: { type: 'string' } },
      required: kind ? ['shared'] : [],
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  const shared = root.structure!.shared;
  expect(shared.required).toBe(false);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  expect(root.structure!.shared).toBe(shared);
  expect(shared.required).toBe(true);
  writeFieldNode(root.structure!.kind, false, 'input', WriteOption.Overwrite);
  expect(shared.required).toBe(false);
});

it('sets required on newly entering children when the required array is retained', () => {
  const { root } = createTestTree({
    type: 'object',
    required: ['a', 'b'],
    properties: { kind: { type: 'boolean', default: false } },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { [kind ? 'b' : 'a']: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  expect(root.structure!.a.required).toBe(true);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  expect(root.structure!.b.required).toBe(true);
});

it('passes only each host own entering children to the required subset', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      left: { type: 'object', properties: { a: { type: 'string' } } },
      right: { type: 'object', properties: { b: { type: 'string' } } },
    },
  });
  loadFieldNodeAtMount(root, { left: {}, right: {} }, WriteOption.Overwrite);
  const { left, right } = root.structure!;
  const scratch = getSettlementScratch(root.runtime);
  const context = createSettlementContext(root, 'callerReplace', 0, scratch);
  context.changedNodes.add(left).add(right);
  context.entered.add(left.structure!.a).add(right.structure!.b);
  left.deliveryChanges |= FieldNodeEventType.UpdateChildren;
  right.deliveryChanges |= FieldNodeEventType.UpdateChildren;
  const subsets = vi.spyOn(requiredChildren, 'getRequiredChildren');
  try {
    markCommitDeliveries(context);
    expect(subsets.mock.calls.find(([host]) => host === left)?.[1]).toEqual([
      left.structure!.a,
    ]);
    expect(subsets.mock.calls.find(([host]) => host === right)?.[1]).toEqual([
      right.structure!.b,
    ]);
  } finally {
    releaseSettlementScratch(scratch);
  }
});

it('orders entering required children by canonical integer keys then stable insertion', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      b: { type: 'string' },
      '10': { type: 'string' },
      '2': { type: 'string' },
      '01': { type: 'string' },
      '4294967295': { type: 'string' },
    },
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  const entering = ['b', '10', '2', '01', '4294967295'].map(
    (name) => root.structure![name],
  );
  expect(
    requiredChildren
      .getRequiredChildren(root, entering)
      .map((child) => child.name),
  ).toEqual(['2', '10', 'b', '01', '4294967295']);
});
