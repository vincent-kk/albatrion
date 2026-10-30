import { expect, it } from 'vitest';

import {
  disposeFieldNodeTree,
  loadFieldNodeAtMount,
  resetFieldNodeForm,
  resetFieldNodeSubtree,
} from '../settle';
import { WriteOption } from '../types/value';
import { createPlainNode } from './fixtures/createPlainNode';
import { createTestTree } from './fixtures/createTestTree';

const schema = {
  type: 'object',
  properties: {
    values: { type: 'array', items: { type: 'string' } },
    sibling: { type: 'string' },
  },
};
const stores = [
  'committedDeclarationKeys',
  'deriveTargetIds',
  'arrayShapes',
  'objectShapes',
  'hostBudgetCaps',
  'arrayChildEntries',
] as const;

it('keeps count and shape memos independent for two trees sharing one blueprint', () => {
  const { root: first, blueprint } = createTestTree(schema);
  const { root: holder } = createTestTree(schema);
  holder.runtime.blueprint = blueprint;
  const second = createPlainNode(blueprint.root, null, holder.runtime);
  loadFieldNodeAtMount(
    first,
    { values: ['a'], sibling: 'x' },
    WriteOption.Overwrite,
  );
  loadFieldNodeAtMount(
    second,
    { values: ['b', 'c'], sibling: 'y' },
    WriteOption.Overwrite,
  );
  const left = first.structure!.values;
  const right = second.structure!.values;
  const selected = left.behavior.declareChildren(left);
  right.behavior.declareChildren(right);
  expect(left.behavior.declareChildren(left)).toBe(selected);
  expect(Reflect.get(first.runtime, 'arrayChildEntries')).toBeInstanceOf(
    WeakMap,
  );
  expect(Reflect.get(first.runtime, 'arrayChildEntries')).not.toBe(
    Reflect.get(second.runtime, 'arrayChildEntries'),
  );
  expect(Reflect.get(first.runtime, 'objectShapes')).not.toBe(
    Reflect.get(second.runtime, 'objectShapes'),
  );
  expect(first.local).toEqual({ values: ['a'], sibling: 'x' });
  expect(second.local).toEqual({ values: ['b', 'c'], sibling: 'y' });
});

it('drops recomputable stores on form reset and disposal, preserving partial-reset stores', () => {
  const { root } = createTestTree(schema);
  const value = { values: ['a'], sibling: 'x' };
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  const sentinel = {};
  for (const name of stores) {
    const memo: WeakMap<object, unknown> =
      Reflect.get(root.runtime, name) ?? new WeakMap();
    Reflect.set(root.runtime, name, memo);
    memo.set(sentinel, {});
  }
  resetFieldNodeSubtree(root.structure!.sibling, WriteOption.Overwrite);
  for (const name of stores)
    expect(Reflect.get(root.runtime, name)!.has(sentinel)).toBe(true);
  const runtime = root.runtime;
  resetFieldNodeForm(root, value, WriteOption.Overwrite);
  expect(root.runtime).toBe(runtime);
  for (const name of stores)
    expect(Reflect.get(runtime, name)?.has(sentinel) ?? false).toBe(false);
  disposeFieldNodeTree(root);
  for (const name of stores) expect(Reflect.get(runtime, name)).toBeUndefined();
});
