import { describe, expect, it } from 'vitest';

import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/**
 * An object whose `list` array holds `items`, with any further array keywords.
 * @param items - Item template of the array
 * @param array - Further keywords of the array itself
 * @returns The object schema
 */
const listOf = (
  items: Readonly<Record<string, unknown>>,
  array: Readonly<Record<string, unknown>> = {},
) => ({
  type: 'object',
  properties: { list: { type: 'array', items, ...array } },
});

// filid:contract settle-array-empty-item-null-negatives
describe('a null that stays a real value or a misfit', () => {
  it.each([
    ['a nullable type list', { type: ['string', 'null'], default: 'D' }],
    ['nullable: true', { type: 'string', nullable: true, default: 'D' }],
    ["type: 'null'", { type: 'null' }],
  ])(
    'keeps a null item of %s as a real null without its default',
    (_n, items) => {
      const tree = mountPublicTree(listOf(items), { list: [null] });
      const item = tree.at('/list/0');
      expect([item.source, item.value, item.isMisfit]).toEqual([
        null,
        null,
        false,
      ]);
      expect(tree.root.outputValue).toEqual({ list: [null] });
    },
  );

  it('keeps the null of a statically nullable item a real null while a gate narrows it to string', () => {
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          list: { type: 'array', items: { type: ['string', 'null'] } },
        },
        if: { properties: { flag: { const: true } }, required: ['flag'] },
        then: { properties: { list: { items: { type: 'string' } } } },
      },
      { flag: true, list: ['x', null] },
    );
    const item = tree.at('/list/1');
    expect(item.jsonSchema).toMatchObject({ type: 'string', nullable: false });
    expect([item.source, item.value, item.isMisfit]).toEqual([
      null,
      null,
      false,
    ]);
  });

  it.each([
    ['object', { type: 'object', properties: { n: { type: 'string' } } }],
    ['array', { type: 'array', items: { type: 'string' } }],
  ])('keeps a null %s item a misfit', (_kind, items) => {
    const tree = mountPublicTree(listOf(items), { list: [null] });
    expect([tree.at('/list/0').value, tree.at('/list/0').isMisfit]).toEqual([
      null,
      true,
    ]);
    expect(
      tree.root.runtime.misfitRecords?.map((record) => record.path),
    ).toEqual(['/list/0']);
  });

  it('keeps a terminal array value as it was given', () => {
    const tree = mountPublicTree(
      listOf({ type: 'string', default: 'D' }, { options: { terminal: true } }),
      { list: ['x', null] },
    );
    expect(tree.at('/list').value).toEqual(['x', null]);
    expect(tree.root.misfits).toEqual([]);
  });

  it.each([
    ['loaded into an object property', false],
    ['carried by a gated property into the shape', true],
  ])('keeps a null %s a misfit without its default', (_how, gated) => {
    const property = { type: 'string', default: 'D' };
    const tree = mountPublicTree(
      {
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          s: gated
            ? { ...property, controls: { active: '../flag === true' } }
            : property,
        },
      },
      { flag: !gated, s: null },
    );
    if (gated) tree.at('/flag').setValue(true);
    expect([tree.at('/s').value, tree.at('/s').isMisfit]).toEqual([null, true]);
    expect(tree.root.outputValue).toEqual({ flag: true, s: null });
  });

  it.each([
    [
      'omitTrailingEmpty trims',
      listOf({ type: 'string' }, { options: { omitTrailingEmpty: true } }),
      ['x'],
    ],
    [
      'an item with omitEmpty: false keeps',
      listOf({ type: 'string', options: { omitEmpty: false } }),
      ['x', null],
    ],
  ])(
    '%s the emitted placeholder of an empty item',
    (_projection, schema, output) => {
      const tree = mountPublicTree(schema, { list: ['x', null] });
      expect(tree.root.outputValue).toEqual({ list: output });
      expect(tree.arrayAt('/list').children).toHaveLength(2);
      expectEmptyItem(tree.at('/list/1'));
    },
  );

  it('reloads the placeholder of a cleared nullable item as a real null with the same output and errors', async () => {
    const schema = listOf({ type: ['string', 'null'], minLength: 2 });
    const live = mountPublicTree(schema, { list: ['x', 'yy'] });
    live.at('/list/1').setValue(undefined);
    const reloaded = mountPublicTree(
      schema,
      JSON.parse(JSON.stringify(live.root.outputValue)),
    );
    expect([live.at('/list/1').value, reloaded.at('/list/1').value]).toEqual([
      undefined,
      null,
    ]);
    expect(reloaded.root.outputValue).toEqual(live.root.outputValue);
    const errors = await live.root.validate();
    expect(errors.map((issue) => issue.dataPath)).toEqual(['/list/0']);
    expect(await reloaded.root.validate()).toEqual(errors);
  });
});
