import { describe, expect, it } from 'vitest';

import { createItemFoldTree } from '../../__tests__/fixtures/createItemFoldTree';
import { StaticFirstLoadCapability } from '../StaticFirstLoadCapability';
import { getItemEntries } from '../utils/itemEntry/getItemEntries';
import { getItemEntry } from '../utils/itemEntry/getItemEntry';

describe('array item fold candidates', () => {
  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s retains ordered candidates and the legacy first-candidate shape',
    (keyword) => {
      const { blueprint } = createItemFoldTree(keyword);
      const host = blueprint.root.childEntries.find(
        (entry) => entry.name === 'list',
      )!.node;
      const candidates = getItemEntries(host, 0);
      expect(candidates.map((entry) => entry.node.kind)).toEqual([
        'string',
        'number',
      ]);
      expect(getItemEntry(host, 0)).toBe(candidates[0]);
      expect(keyword === 'items' ? host.item : host.prefixItems?.[0]).toBe(
        candidates[0].node,
      );
      expect(candidates[1].declarations[0].schemaPath).toBe(
        '#/properties/list/allOf/1/' +
          keyword +
          (keyword === 'items' ? '' : '/0'),
      );
      expect(getItemEntries(host, 0)).toBe(candidates);
      expect(Object.isFrozen(candidates)).toBe(true);
      expect(StaticFirstLoadCapability.has(blueprint)).toBe(false);
    },
  );
});
