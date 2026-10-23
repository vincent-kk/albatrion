import { describe, expect, it } from 'vitest';

import { getFragmentOwnerPaths } from '../getFragmentOwnerPaths';

// filid:contract fragment-owner-paths
describe('getFragmentOwnerPaths', () => {
  it.each([
    ['#/allOf/0/properties/a', ['#/allOf/0']],
    ['#/properties/list/allOf/0/items', ['#', '#/properties/list/allOf/0']],
    ['#/allOf/0/additionalItems', ['#/allOf/0']],
    ['#/allOf/0/items/0', ['#/allOf/0']],
    ['#/allOf/0/prefixItems/1', ['#/allOf/0']],
    ['#/allOf/0/items/allOf/1', ['#/allOf/0']],
    ['#/allOf/0/items/items', ['#/allOf/0', '#/allOf/0/items']],
  ])('CONTROLS-077 lists every direct declarer of %s', (path, owners) => {
    expect(getFragmentOwnerPaths(path)).toEqual(owners);
  });

  it.each([
    ['#/allOf/0/itemsList'],
    ['#/allOf/0/additionalItemsX'],
    ['#/allOf/0/prefixItems'],
    ['#/allOf/0/properties'],
    ['#/allOf/0'],
    ['#'],
  ])('CONTROLS-077 finds no declarer for %s', (path) => {
    expect(getFragmentOwnerPaths(path)).toEqual([]);
  });

  it('CONTROLS-077 reads a property literally named after a keyword as a name', () => {
    expect(getFragmentOwnerPaths('#/allOf/0/properties/items')).toEqual([
      '#/allOf/0',
      '#/allOf/0/properties',
    ]);
    expect(
      getFragmentOwnerPaths('#/allOf/0/properties/properties/properties/a'),
    ).toEqual([
      '#/allOf/0',
      '#/allOf/0/properties',
      '#/allOf/0/properties/properties',
    ]);
  });
});
