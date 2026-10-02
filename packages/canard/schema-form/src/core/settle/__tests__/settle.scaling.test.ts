import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { getDependencyIndex } from '../utils/write/getDependencyIndex';
import { hasRecursiveExpansion } from '../utils/compute/hasRecursiveExpansion';
import { updateOutput } from '../utils/compute/updateOutput';
import { registerRecalculation } from '../utils/write/registerRecalculation';
import { DirtyPathSet } from '../utils/write/DirtyPathSet';
import type { SettlementContext } from '../type';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it('82C-01 restores equal composite children without inspecting unchanged siblings', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    child: { type: 'object', properties: { value: { type: 'string' } } },
    sibling: { type: 'string' },
  } });
  loadSchemaNodeAtMount(root, { child: { value: 'same' }, sibling: 'kept' },
    SetValueOption.Overwrite);
  const previous = root.local;
  const child = root.structure!.child;
  child.emit = { value: 'same' };
  updateOutput(root, { changedNodes: new Set() } as SettlementContext<typeof root>, [child]);
  expect(root.local).toBe(previous);
  expect(root.emit).toBe(previous);
});

it('82C-01 skips ancestor walks for an acyclic blueprint', () => {
  const { root, blueprint: analysis } = createTestTree({ type: 'object',
    properties: { value: { type: 'string' } } });
  let parentReads = 0;
  Object.defineProperty(root, 'parent', { get: () => { parentReads++; return null; } });
  expect(hasRecursiveExpansion(root, analysis.root.childEntries[0].node,
    undefined, {} as SettlementContext<typeof root>)).toBe(false);
  expect(parentReads).toBe(0);
});

it('82C-01 expands each dirty ancestor only once', () => {
  const { root } = createTestTree({ type: 'object' });
  const dirtyPaths = new DirtyPathSet(new Map());
  for (let depth = 1; depth <= 32; depth++) dirtyPaths.add('/a'.repeat(depth));
  const add = vi.spyOn(dirtyPaths, 'add');
  registerRecalculation({ root, dirtyPaths, changedRaw: new Set(), hasGates: false,
  } as unknown as SettlementContext<typeof root>);
  expect(dirtyPaths.has('')).toBe(true);
  expect(add.mock.calls.length).toBeLessThanOrEqual(32);
});

it('82C-01 indexes shared dependency owners without pairwise comparisons', () => {
  const analysis = blueprint({ type: 'object', properties: {
    kind: { type: 'string' },
  }, oneOf: Array.from({ length: 64 }, (_, index) => ({
    controls: { active: `./kind === '${index}'` },
    properties: { [`value${index}`]: { type: 'string' } },
  })) });
  const some = Array.prototype.some;
  let comparisons = 0;
  vi.spyOn(Array.prototype, 'some').mockImplementation(function (this: unknown[], callback, receiver) {
    return some.call(this, (value, index, array) => {
      if (value && typeof value === 'object' && 'bindable' in value)
        comparisons++;
      return callback.call(receiver, value, index, array);
    });
  });
  getDependencyIndex(analysis);
  expect(comparisons).toBe(0);
});

it('82C-01 collects gate identities without quadratic array membership', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    kind: { type: 'string', default: '0' },
  }, oneOf: Array.from({ length: 32 }, (_, index) => ({
    controls: { active: `./kind === '${index}'` },
    properties: { [`value${index}`]: { type: 'string', default: 'value' } },
  })) });
  const includes = Array.prototype.includes;
  let comparisons = 0;
  vi.spyOn(Array.prototype, 'includes').mockImplementation(function (this: unknown[], value, from) {
    if (value && typeof value === 'object' && 'schemaPath' in value && 'hostPath' in value)
      comparisons += this.length;
    return includes.call(this, value, from);
  });
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.emit).toEqual({ kind: '0', value0: 'value' });
  expect(comparisons).toBe(0);
});

it('82C-01 fills nested mounts without sorting entered records', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    left: { type: 'object', properties: { value: { type: 'string', default: 'a' } } },
    right: { type: 'object', properties: { value: { type: 'string', default: 'b' } } },
  } });
  const sort = Array.prototype.sort;
  let sortedRecords = 0;
  vi.spyOn(Array.prototype, 'sort').mockImplementation(function (this: unknown[], compare) {
    if (this[0] && typeof this[0] === 'object' && 'depth' in this[0])
      sortedRecords += this.length;
    return sort.call(this, compare);
  });
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.emit).toEqual({ left: { value: 'a' }, right: { value: 'b' } });
  expect(sortedRecords).toBe(0);
});
