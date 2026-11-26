import { describe, expect, it } from 'vitest';

import type { FieldNode } from '@/schema-form/core/surface';

import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** Mounted public tree with its lookups. */
type Tree = ReturnType<typeof mountPublicTree>;

/** Where `flag` gates the list: each item, the array, or the object holding the array. */
type GateLevel = 'item' | 'array' | 'branch';

/** String items that default to 'D', so a refill would be visible. */
const items = { type: 'string', default: 'D' };

/**
 * Build a form whose `flag` gates a two-item list at one level.
 * @param level - The gated node: each item, the array, or the object holding it
 * @returns The schema, the list path, and a function wrapping a list value in a whole form value
 */
const gatedForm = (level: GateLevel) => {
  const active = (depth: string) => ({ active: `${depth}flag === true` });
  const list =
    level === 'item'
      ? { type: 'array', items: { ...items, controls: active('../../') } }
      : level === 'array'
        ? { type: 'array', items, controls: active('../') }
        : { type: 'array', items };
  const properties =
    level === 'branch'
      ? {
          branch: {
            type: 'object',
            controls: active('../'),
            properties: { list },
          },
        }
      : { list };
  return {
    schema: {
      type: 'object',
      properties: { flag: { type: 'boolean' }, ...properties },
    },
    path: level === 'branch' ? '/branch/list' : '/list',
    form: (flag: boolean, value: unknown[]) =>
      level === 'branch'
        ? { flag, branch: { list: value } }
        : { flag, list: value },
  };
};

/**
 * Read the sources of the live items of an array.
 * @param tree - Mounted tree holding a live array at `path`
 * @param path - Array path
 * @returns Each live item's source in index order
 */
const readSources = (tree: Tree, path: string) =>
  tree.at(path).children?.map((item: FieldNode) => item.source);

// filid:contract settle-array-empty-item-reentry
describe.each(['item', 'array', 'branch'] as const)(
  'an item emptied and re-entering through its %s gate',
  (level) => {
    it.each([
      [
        'writing undefined to the item',
        undefined,
        (tree: Tree, path: string) => tree.at(`${path}/1`).setValue(undefined),
      ],
      [
        'writing null to the item',
        null,
        (tree: Tree, path: string) => tree.at(`${path}/1`).setValue(null),
      ],
      [
        'writing the array with an undefined entry',
        undefined,
        (tree: Tree, path: string) => tree.at(path).setValue(['x', undefined]),
      ],
    ])(
      'stays empty after %s, whether the emptying and the exit come in two calls, one call or one batch',
      (_emptying, emptied, empty) => {
        const { schema, path, form } = gatedForm(level);
        const fresh = mountPublicTree(schema, form(true, ['x', null]));
        for (const grouping of ['two calls', 'one call', 'batch'] as const) {
          const tree = mountPublicTree(schema, form(true, ['x', 'y']));
          if (grouping === 'two calls') {
            empty(tree, path);
            tree.at('/flag').setValue(false);
          } else if (grouping === 'one call')
            tree.root.setValue(form(false, ['x', emptied]));
          else
            tree.root.batch(() => {
              empty(tree, path);
              tree.at('/flag').setValue(false);
            });
          tree.at('/flag').setValue(true);
          expect({ grouping, output: tree.root.outputValue }).toEqual({
            grouping,
            output: form(true, ['x', null]),
          });
          expect({ grouping, sources: readSources(tree, path) }).toEqual({
            grouping,
            sources: readSources(fresh, path),
          });
          expectEmptyItem(tree.at(`${path}/1`));
        }
      },
    );
  },
);
