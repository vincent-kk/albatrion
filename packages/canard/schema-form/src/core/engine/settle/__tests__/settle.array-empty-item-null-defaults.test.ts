import { describe, expect, it } from 'vitest';

import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** String items that default to 'D'. */
const items = { type: 'string', default: 'D' };

/**
 * An object whose `flag` gates every item of `list` through the item's own gate.
 * @param controls - Further controls of each item
 * @returns The object schema
 */
const itemGatedList = (controls: Readonly<Record<string, unknown>> = {}) => ({
  type: 'object',
  properties: {
    flag: { type: 'boolean' },
    list: {
      type: 'array',
      items: {
        ...items,
        controls: { active: '../../flag === true', ...controls },
      },
    },
  },
});

/**
 * An object whose `flag` gates a `list` of `items`, directly or through the branch holding it.
 * @param gated - `list` leaves through its own gate, `branch` leaves with the object holding it
 * @returns The schema and the path of the list's second item
 */
const gatedList = (gated: 'list' | 'branch') => {
  const active = { active: '../flag === true' };
  const list = { type: 'array', items };
  return gated === 'list'
    ? {
        schema: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            list: { ...list, controls: active },
          },
        },
        item: '/list/1',
      }
    : {
        schema: {
          type: 'object',
          properties: {
            flag: { type: 'boolean' },
            branch: {
              type: 'object',
              controls: active,
              properties: { list },
            },
          },
        },
        item: '/branch/list/1',
      };
};

// filid:contract settle-array-empty-item-null-defaults
describe('defaults around a null item position', () => {
  it("does not apply a parent's default to a parent given a null item", () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          host: {
            type: 'object',
            default: { list: ['Z'] },
            properties: { list: { type: 'array', items } },
          },
        },
      },
      { host: { list: [null] } },
    );
    expect(tree.root.outputValue).toEqual({ host: { list: [null] } });
    expectEmptyItem(tree.at('/host/list/0'));
  });

  it("does not apply the array's own default to an array given a null item", () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          list: { type: 'array', default: ['A', 'B'], items },
        },
      },
      { list: [null] },
    );
    expect(tree.root.outputValue).toEqual({ list: [null] });
    expectEmptyItem(tree.at('/list/0'));
  });

  it.each([
    [
      'an undefined array entry',
      { list: { type: 'array', items } },
      { list: ['x', undefined] },
      { list: ['x', 'D'] },
    ],
    [
      'an undefined object property',
      { a: items },
      { a: undefined },
      { a: 'D' },
    ],
  ])('fills %s with its default', (_position, properties, value, output) => {
    const tree = mountPublicTree({ type: 'object', properties }, value);
    expect(tree.root.outputValue).toEqual(output);
  });

  it('fills an item pushed without a value with its default', () => {
    const tree = mountPublicTree(
      { type: 'object', properties: { list: { type: 'array', items } } },
      { list: ['x'] },
    );
    tree.arrayAt('/list').push();
    expect(tree.root.outputValue).toEqual({ list: ['x', 'D'] });
  });

  it.each([null, undefined])(
    'keeps an item cleared with %s empty without its default when its array re-enters through a gate',
    (cleared) => {
      const { schema, item } = gatedList('list');
      const tree = mountPublicTree(schema, { flag: true, list: ['x', 'y'] });
      tree.at(item).setValue(cleared);
      tree.at('/flag').setValue(false);
      tree.at('/flag').setValue(true);
      expect(tree.root.outputValue).toEqual({ flag: true, list: ['x', null] });
      expectEmptyItem(tree.at(item));
    },
  );

  it('keeps an item cleared with null empty without its default when the branch holding its array re-enters', () => {
    const { schema, item } = gatedList('branch');
    const tree = mountPublicTree(schema, {
      flag: true,
      branch: { list: ['x', 'y'] },
    });
    tree.at(item).setValue(null);
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({
      flag: true,
      branch: { list: ['x', null] },
    });
    expectEmptyItem(tree.at(item));
  });

  it('keeps an item cleared with null empty without its default when the item re-enters through its own gate', () => {
    const tree = mountPublicTree(itemGatedList(), {
      flag: true,
      list: ['x', 'y'],
    });
    tree.at('/list/1').setValue(null);
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
  });

  it.each([
    ['loaded while the item was inactive', false],
    ['written while the item was inactive', true],
  ])(
    'keeps a null %s an empty item without its default when the item re-enters',
    (_kept, written) => {
      const tree = mountPublicTree(itemGatedList(), {
        flag: written,
        list: written ? ['x', 'y'] : ['x', null],
      });
      if (written) {
        tree.at('/flag').setValue(false);
        tree.root.setValue({ flag: false, list: ['x', null] });
      }
      tree.at('/flag').setValue(true);
      expect(tree.root.outputValue).toEqual({ flag: true, list: ['x', null] });
      expectEmptyItem(tree.at('/list/1'));
      expect(tree.root.runtime.misfitRecords).toEqual([]);
    },
  );

  it('keeps the null an item left with its inactiveValue an empty item when the item re-enters', () => {
    const tree = mountPublicTree(itemGatedList({ inactiveValue: null }), {
      flag: true,
      list: ['x', 'y'],
    });
    tree.at('/flag').setValue(false);
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({ flag: true, list: [null, null] });
    expectEmptyItem(tree.at('/list/0'));
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
  });

  it('keeps a null loaded into an inactive array of item candidates an empty item on activation', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          kind: { type: 'string' },
          flag: { type: 'boolean' },
          list: {
            type: 'array',
            controls: { active: '../flag === true' },
            allOf: [
              { controls: { active: '../kind === "s"' }, items },
              {
                controls: { active: '../kind === "n"' },
                items: { type: 'number', default: 1 },
              },
            ],
          },
        },
      },
      { kind: 's', flag: false, list: ['x', null] },
    );
    tree.at('/flag').setValue(true);
    expect(tree.root.outputValue).toEqual({
      kind: 's',
      flag: true,
      list: ['x', null],
    });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
  });
});
