import { expect, it } from 'vitest';

import {
  disposeFieldNodeTree,
  loadFieldNodeAtMount,
  resetFieldNodeForm,
  resetFieldNodeSubtree,
} from '../settle';
import { WriteOption } from '../types/value';
import { getCommittedDeclarationKey } from '../utils/controls/getCommittedDeclarationKey';
import { createPlainNode } from './fixtures/createPlainNode';
import { createTestTree } from './fixtures/createTestTree';

const schema = {
  type: 'object',
  properties: {
    values: { type: 'array', items: { type: 'string' } },
    sibling: { type: 'string' },
  },
};
const nodeMemos = [
  '__objectShape__',
  '__arrayShape__',
  '__childEntries__',
  '__declarationKey__',
  '__budgetCap__',
  '__deriveTargetId__',
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
  const left = first.__childrenByName__!.values;
  const right = second.__childrenByName__!.values;
  const selected = left.behavior.declareChildren(left);
  right.behavior.declareChildren(right);
  expect(left.behavior.declareChildren(left)).toBe(selected);
  expect(left.__childEntries__).toBeDefined();
  expect(right.__childEntries__).toBeDefined();
  expect(left.__childEntries__).not.toBe(right.__childEntries__);
  expect(first.__objectShape__).toBeDefined();
  expect(second.__objectShape__).toBeDefined();
  expect(first.__objectShape__).not.toBe(second.__objectShape__);
  expect(first.__value__).toEqual({ values: ['a'], sibling: 'x' });
  expect(second.__value__).toEqual({ values: ['b', 'c'], sibling: 'y' });
});

it('drops recomputable memos on form reset and disposal, preserving them on partial reset', () => {
  const { root } = createTestTree({
    ...schema,
    properties: {
      ...schema.properties,
      twin: { type: 'string', controls: { derived: '../sibling' } },
    },
  });
  const value = { values: ['a'], sibling: 'x' };
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  const { values, sibling, twin } = root.__childrenByName__!;
  getCommittedDeclarationKey(values);
  const entries = values.__childEntries__;
  const key = values.__declarationKey__;
  expect(entries).toBeDefined();
  expect(key).toBeDefined();
  expect(values.__arrayShape__).toBeDefined();
  expect(root.__objectShape__).toBeDefined();
  const targetId = twin.__deriveTargetId__;
  expect(targetId).toBeDefined();
  resetFieldNodeSubtree(values, WriteOption.Overwrite);
  expect(values.__childEntries__).toBe(entries);
  expect(values.__declarationKey__).toBe(key);
  expect(twin.__deriveTargetId__).toBe(targetId);
  const runtime = root.runtime;
  resetFieldNodeForm(root, value, WriteOption.Overwrite);
  expect(root.runtime).toBe(runtime);
  expect(values.__childEntries__).toBeDefined();
  expect(values.__childEntries__).not.toBe(entries);
  expect(values.__declarationKey__).not.toBe(key);
  expect(twin.__deriveTargetId__).toBeDefined();
  expect(twin.__deriveTargetId__).not.toBe(targetId);
  disposeFieldNodeTree(root);
  for (const node of [root, values, sibling, twin])
    for (const name of nodeMemos) expect(node[name]).toBeUndefined();
});
