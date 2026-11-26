import { describe, expect, it } from 'vitest';

import { expectEmptyItem } from './fixtures/expectEmptyItem';
import { mountPublicTree } from './fixtures/mountPublicTree';

/** An object whose `list` holds string items that default to 'D'. */
const stringList = {
  type: 'object',
  properties: {
    list: { type: 'array', items: { type: 'string', default: 'D' } },
  },
};

// filid:contract settle-array-empty-item-null
describe('a null item position in a caller load', () => {
  it.each([
    ['string-or-number union', { type: ['string', 'number'], default: 3 }],
    [
      'union that includes object',
      { type: ['string', 'object'], default: 'D' },
    ],
  ])('reads a null %s item as an empty item', (_kind, items) => {
    const tree = mountPublicTree(
      { type: 'object', properties: { list: { type: 'array', items } } },
      { list: [null] },
    );
    expect(tree.root.outputValue).toEqual({ list: [null] });
    expectEmptyItem(tree.at('/list/0'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
  });

  it('keeps the emitted placeholder and the validator error of the empty item', async () => {
    const tree = mountPublicTree(stringList, { list: ['x', null] });
    expect(tree.root.outputValue).toEqual({ list: ['x', null] });
    expectEmptyItem(tree.at('/list/1'));
    expect(tree.root.runtime.misfitRecords).toEqual([]);
    expect(
      (await tree.root.validate()).map((issue) => [
        issue.dataPath,
        issue.message,
      ]),
    ).toEqual([['/list/1', 'must be string']]);
  });

  it('reloads a cleared item from its saved JSON output as the same empty item', async () => {
    const live = mountPublicTree(stringList, { list: ['x', 'y'] });
    live.at('/list/1').setValue(undefined);
    const saved: unknown = JSON.parse(JSON.stringify(live.root.outputValue));
    const reloaded = mountPublicTree(stringList, saved);
    expect(saved).toEqual({ list: ['x', null] });
    expect(reloaded.root.outputValue).toEqual(live.root.outputValue);
    expectEmptyItem(live.at('/list/1'));
    expectEmptyItem(reloaded.at('/list/1'));
    expect(reloaded.root.runtime.misfitRecords).toEqual([]);
    expect(await reloaded.root.validate()).toEqual(await live.root.validate());
  });
});
