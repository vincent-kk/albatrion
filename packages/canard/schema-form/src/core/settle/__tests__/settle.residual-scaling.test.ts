import { afterEach, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import type { SettlementContext } from '../type';
import * as sourcePresence from '../utils/transition/isMissingRaw';
import { DirtyPathSet } from '../utils/write/DirtyPathSet';
import { registerRecalculation } from '../utils/write/registerRecalculation';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it.each([3, 5])('skips subtree source scans for default-free branches at depth %i', (depth) => {
  const schema = (level: number): BlueprintSchema => level === 0
    ? { type: 'string', default: 'filled' }
    : { type: 'object', properties: Object.fromEntries(
      Array.from({ length: 4 }, (_, index) => [`f${index}`, schema(level - 1)]),
    ) };
  const { root } = createTestTree(schema(depth));
  const missing = vi.spyOn(sourcePresence, 'isMissingRaw');
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(missing.mock.calls.filter(([node]) => node.behavior.strategy === 'branch')).toHaveLength(0);
  expect(missing.mock.calls).toHaveLength(4 ** depth);
  let value = root.emit;
  for (let level = 0; level < depth; level++) value = Reflect.get(value as object, 'f0');
  expect(value).toBe('filled');
});

it.each([4, 16, 64])('indexes a depth-%i ungated update with one edge per ancestor', (depth) => {
  const { root } = createTestTree({ type: 'object' });
  const index = new Map<string, Map<string, string>>();
  const dirtyPaths = new DirtyPathSet(index);
  dirtyPaths.add('/a'.repeat(depth));
  registerRecalculation({ root, dirtyPaths, changedRaw: new Set(), hasGates: false,
  } as unknown as SettlementContext<typeof root>);
  expect(dirtyPaths.size).toBe(depth + 1);
  expect([...index.values()].reduce((sum, children) => sum + children.size, 0)).toBe(depth);
  for (let remaining = depth; remaining >= 0; remaining--)
    dirtyPaths.delete('/a'.repeat(remaining));
  expect(index.size).toBe(0);
});

it('retains arbitrary deletion order in the general index', () => {
  const index = new Map<string, Map<string, string>>();
  const paths = new DirtyPathSet(index);
  paths.add('/a/x').add('/b').add('/a/y');
  paths.delete('/a/x');
  expect([...index.get('')!.values()]).toEqual(['b', 'a']);
});

it('repairs ancestors of an unresolved dirty path on the next registration', () => {
  const { root } = createTestTree({ type: 'object' });
  const index = new Map<string, Map<string, string>>();
  const dirtyPaths = new DirtyPathSet(index);
  dirtyPaths.add('/items/99/value');
  const context = { root, dirtyPaths, changedRaw: new Set(), hasGates: false,
  } as unknown as SettlementContext<typeof root>;
  registerRecalculation(context);
  dirtyPaths.delete('/items');
  dirtyPaths.delete('');
  registerRecalculation(context);
  expect(dirtyPaths.has('')).toBe(true);
  expect([...index.get('')!.values()]).toEqual(['items']);
  dirtyPaths.clear();
  dirtyPaths.add('/right/value').add('/left/value');
  expect([...index.get('')!.values()]).toEqual(['right', 'left']);
});

it('preserves parent default priority and existing descendant sources', () => {
  const definition: BlueprintSchema = { type: 'object', properties: {
    group: { type: 'object', default: { value: 'parent' }, properties: {
      value: { type: 'string', default: 'child' },
    } },
  } };
  const { root } = createTestTree(definition);
  loadSchemaNodeAtMount(root, undefined, SetValueOption.Overwrite);
  expect(root.emit).toEqual({ group: { value: 'parent' } });
  loadSchemaNodeAtMount(root, { group: { value: 'existing' } }, SetValueOption.Overwrite);
  expect(root.emit).toEqual({ group: { value: 'existing' } });
});

it('preserves frontier order across conversion and restores general mode after clear', () => {
  const index = new Map<string, Map<string, string>>();
  const paths = new DirtyPathSet(index);
  paths.add('/a/x').add('/b/y').add('/a');
  paths.beginPostOrder();
  paths.beginPostOrder();
  expect([...index.get('')!.values()]).toEqual(['a', 'b']);
  paths.clear();
  paths.add('/a/x').add('/b').add('/a/y');
  paths.delete('/a/x');
  expect([...index.get('')!.values()]).toEqual(['b', 'a']);
  paths.clear();
  paths.add('');
  paths.beginPostOrder();
  paths.add('/a/b/c');
  expect(paths.size).toBe(4);
  expect([...index.values()].reduce((sum, children) => sum + children.size, 0)).toBe(3);
});
