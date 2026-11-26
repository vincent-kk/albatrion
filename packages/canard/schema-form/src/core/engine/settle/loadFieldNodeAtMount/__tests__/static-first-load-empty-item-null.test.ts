import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlueprintSchema } from '../../../blueprint';
import { expectEmptyItem } from '../../__tests__/fixtures/expectEmptyItem';
import { mountPublicTree } from '../../__tests__/fixtures/mountPublicTree';
import * as staticFirstAdmission from '../utils/staticFirst/canLoadStaticFirstTree';

afterEach(() => vi.restoreAllMocks());

/** First-load route: the literal-default loader, or the general load it must equal. */
type LoadPath = 'static-first' | 'generic';

/**
 * Mount a schema with no caller input through one first-load path.
 * @param schema - Branchless schema whose literal defaults carry the null
 * @param path - `generic` refuses the static-first admission; `static-first` leaves it to the schema
 * @returns The mounted tree, after asserting that the admission decided the requested path
 */
const mountDefaults = (schema: BlueprintSchema, path: LoadPath) => {
  const admission = vi.spyOn(staticFirstAdmission, 'canLoadStaticFirstTree');
  if (path === 'generic') admission.mockReturnValue(false);
  const tree = mountPublicTree(schema);
  expect(admission).toHaveLastReturnedWith(path === 'static-first');
  return tree;
};

/**
 * Wrap item declarations in a `list` array property whose literal default is `list`.
 * @param list - Array default holding the null under test
 * @param declaration - `items` or `prefixItems` declaration of the array
 * @returns An object schema with that single array property
 */
const listDefault = (
  list: unknown[],
  declaration: Readonly<Record<string, unknown>>,
) => ({
  type: 'object',
  properties: { list: { type: 'array', default: list, ...declaration } },
});

// filid:contract settle-static-first-load-empty-item-null
describe.each(['static-first', 'generic'] as const)(
  'a null item position in a literal default, %s first load',
  (path) => {
    it.each([
      ['string', { type: 'string', default: 'D' }, ['x', null]],
      ['integer', { type: 'integer', default: 7 }, [1, null]],
      ['boolean', { type: 'boolean', default: false }, [true, null]],
    ])(
      'reads a null %s item as an empty item without its default or a warning',
      (_kind, items, list) => {
        const tree = mountDefaults(listDefault(list, { items }), path);
        expect(tree.root.outputValue).toEqual({ list });
        expectEmptyItem(tree.at('/list/1'));
        expect(tree.root.runtime.misfitRecords).toEqual([]);
      },
    );

    it('reads both null tuple positions as empty items without their position defaults', () => {
      const tree = mountDefaults(
        listDefault([null, null], {
          prefixItems: [
            { type: 'string', default: 'A' },
            { type: 'boolean', default: true },
          ],
        }),
        path,
      );
      expect(tree.root.outputValue).toEqual({ list: [null, null] });
      expectEmptyItem(tree.at('/list/0'));
      expectEmptyItem(tree.at('/list/1'));
      expect(tree.root.runtime.misfitRecords).toEqual([]);
    });

    it('empties a null leaf inside a nested array but keeps a null array position a misfit', () => {
      const tree = mountDefaults(
        listDefault([[null, 1], null], {
          items: { type: 'array', items: { type: 'number', default: 9 } },
        }),
        path,
      );
      expect(tree.root.outputValue).toEqual({ list: [[null, 1], null] });
      expectEmptyItem(tree.at('/list/0/0'));
      expect([tree.at('/list/1').value, tree.at('/list/1').isMisfit]).toEqual([
        null,
        true,
      ]);
      expect(
        tree.root.runtime.misfitRecords?.map((record) => record.path),
      ).toEqual(['/list/1']);
    });
  },
);
