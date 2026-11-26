import { describe, expect, it } from 'vitest';

import type { FieldNode } from '@/schema-form/core/surface';
import { SetValueOption } from '@/schema-form/core/surface';

import type { BlueprintSchema } from '../../blueprint';
import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** Mounted public tree with its lookups. */
type Tree = ReturnType<typeof mountPublicTree>;

/**
 * Build a form whose `flag` gates a list of string items that default to 'D'.
 * @param level - `item` gates each item, `array` gates the array
 * @param controls - Further controls of each item
 * @returns The object schema
 */
const gatedList = (
  level: 'item' | 'array',
  controls: Readonly<Record<string, unknown>> = {},
): BlueprintSchema => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    list:
      level === 'item'
        ? {
            type: 'array',
            items: {
              type: 'string',
              default: 'D',
              controls: { active: '../../flag === true', ...controls },
            },
          }
        : {
            type: 'array',
            controls: { active: '../flag === true' },
            items: { type: 'string', default: 'D' },
          },
  },
});

/** An array that clears on exit but keeps each string item's own source. */
const COMPACTING: BlueprintSchema = {
  type: 'object',
  properties: {
    open: { type: 'boolean' },
    list: {
      type: 'array',
      controls: { active: '#/open', unsetOnInactive: true },
      items: { type: 'string', controls: { unsetOnInactive: false } },
    },
  },
};

/**
 * Read the sources of the live items of `/list`.
 * @param tree - Mounted tree with a live `/list` array
 * @returns Each live item's source in index order
 */
const readSources = (tree: Tree) =>
  tree.at('/list').children?.map((item: FieldNode) => item.source);

// filid:contract settle-array-empty-item-hidden
describe('hidden array item positions and settlements without the fill', () => {
  it.each([
    [
      'null written to an existing hidden position',
      'item',
      ['x', 'y'],
      false,
      (tree: Tree) => tree.at('/list').setValue(['x', null]),
      ['x', null],
      ['x', null],
    ],
    [
      'undefined written to an existing hidden position',
      'item',
      ['x', 'y'],
      false,
      (tree: Tree) => tree.at('/list').setValue(['x', undefined]),
      ['x', undefined],
      ['x', 'D'],
    ],
    [
      'push() on the hidden items',
      'item',
      ['x', 'y'],
      false,
      (tree: Tree) => tree.arrayAt('/list').push(),
      ['x', 'y', undefined],
      ['x', 'y', 'D'],
    ],
    [
      'insert(0) on the hidden items',
      'item',
      ['x', 'y'],
      false,
      (tree: Tree) => tree.arrayAt('/list').insert(0),
      [undefined, 'x', 'y'],
      ['D', 'x', 'y'],
    ],
    [
      'a longer array written over the hidden items',
      'item',
      ['x', 'y'],
      false,
      (tree: Tree) => tree.at('/list').setValue(['x', 'y', undefined]),
      ['x', 'y', undefined],
      ['x', 'y', 'D'],
    ],
    [
      'remove(0) after the visible second position was emptied',
      'item',
      ['x', 'y', 'z'],
      true,
      (tree: Tree) => tree.arrayAt('/list').remove(0),
      [null, 'z'],
      [null, 'z'],
    ],
    [
      'a load of undefined and null into hidden items',
      'item',
      undefined,
      false,
      () => {},
      ['x', undefined, null],
      ['x', 'D', null],
    ],
    [
      'a load of undefined and null into a hidden array',
      'array',
      undefined,
      false,
      () => {},
      ['x', undefined, null],
      ['x', 'D', null],
    ],
  ] as const)(
    'shows %s as a fresh load of what the positions hold',
    (_change, level, shown, emptiedFirst, change, held, output) => {
      const schema = gatedList(level);
      const tree = mountPublicTree(
        schema,
        shown ? { flag: true, list: shown } : { flag: false, list: held },
      );
      if (shown) {
        if (emptiedFirst) tree.at('/list/1').setValue(undefined);
        tree.at('/flag').setValue(false);
        change(tree);
      }
      tree.at('/flag').setValue(true);
      const fresh = mountPublicTree(schema, { flag: true, list: held });
      expect(tree.root.outputValue).toEqual({ flag: true, list: output });
      expect(fresh.root.outputValue).toEqual({ flag: true, list: output });
      expect(readSources(tree)).toEqual(output);
      expect(readSources(fresh)).toEqual(output);
    },
  );

  it('discards an emptied item that leaves with unsetOnInactive, so its re-entry takes the default', () => {
    const tree = mountPublicTree(gatedList('item', { unsetOnInactive: true }), {
      flag: true,
      list: ['x', 'y'],
    });
    tree.at('/list/1').setValue(undefined);
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: ['D', 'D'] });
  });

  it('keeps a position created by a write without automatic writes empty, before and after re-entry', () => {
    const tree = mountPublicTree(gatedList('array'), {
      flag: true,
      list: ['x'],
    });
    tree
      .at('/list')
      .setValue(['x', undefined], SetValueOption.DisableAutomaticWrites);
    expectEmptyItem(tree.at('/list/1'));
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
  });

  it('keeps a position created by a settlement that exceeded its derive budget empty, before and after re-entry', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          a: { type: 'number', controls: { derived: '../b + 1' } },
          b: { type: 'number', controls: { derived: '../a + 1' } },
          flag: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '../flag === true' },
            items: { type: 'string', default: 'D' },
          },
        },
      },
      { flag: true, list: ['x'] },
    );
    expect(() =>
      tree.root.setValue({ a: 0, b: 0, flag: true, list: ['x', undefined] }),
    ).toThrow(/budget/);
    expect(readSources(tree)).toEqual(['x', null]);
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(readSources(tree)).toEqual(['x', null]);
    expect(tree.at('/list').outputValue).toEqual(['x', null]);
  });

  it.each([
    [
      'two calls',
      (tree: Tree) => {
        tree.at('/list/1').setValue(undefined);
        tree.at('/open').setValue(false);
      },
    ],
    [
      'one root write',
      (tree: Tree) =>
        tree.root.setValue({ open: false, list: ['first', undefined, 'last'] }),
    ],
    [
      'one batch',
      (tree: Tree) =>
        tree.root.batch(() => {
          tree.at('/list/1').setValue(undefined);
          tree.at('/open').setValue(false);
        }),
    ],
  ])(
    'keeps an item emptied and compacted on exit in %s as an empty position',
    (_grouping, leave) => {
      const tree = mountPublicTree(COMPACTING, {
        open: true,
        list: ['first', 'mid', 'last'],
      });
      leave(tree);
      tree.at('/open').setValue(true);
      expect(tree.root.outputValue).toEqual({
        open: true,
        list: ['first', null, 'last'],
      });
      expectEmptyItem(tree.at('/list/1'));
    },
  );
});
