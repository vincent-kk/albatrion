import { describe, expect, it } from 'vitest';

import { createItemFoldTree } from '../../__tests__/fixtures/createItemFoldTree';
import { getItemEntries } from '../../blueprint';
import { loadFieldNodeAtMount } from '../../settle';
import { WriteOption } from '../../types/value';
import { getDeriveRuleTable } from '../utils/rules/getDeriveRuleTable';

describe('array fragment derive candidates', () => {
  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s binds one target row per candidate with its own declaration IDs',
    (keyword) => {
      const { root, blueprint } = createItemFoldTree(keyword, undefined, [
        { derived: '"first"' },
        { derived: '42' },
      ]);
      const host = blueprint.root.childEntries.find(
        (entry) => entry.name === 'list',
      )!.node;
      const candidates = getItemEntries(host, 0);
      const rules = getDeriveRuleTable(blueprint).rules.filter(
        (rule) => rule.layer === 'fragment',
      );
      expect(rules).toHaveLength(2);
      expect(rules.map((rule) => [rule.targetName, rule.targetItems])).toEqual(
        keyword === 'items'
          ? [
              [undefined, true],
              [undefined, true],
            ]
          : [
              ['0', undefined],
              ['0', undefined],
            ],
      );
      expect(rules.map((rule) => rule.targetDeclarationIds)).toEqual(
        candidates.map((entry) =>
          entry.declarations.map((declaration) => declaration.id),
        ),
      );
      loadFieldNodeAtMount(
        root,
        { a: false, b: true, list: [0] },
        WriteOption.Overwrite,
      );
      expect(root.structure!.list.structure!['0'].raw).toBe(42);
    },
  );
});
