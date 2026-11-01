import { describe, expect, it } from 'vitest';

import { createItemFoldTree } from '../../../__tests__/fixtures/createItemFoldTree';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../../types/value';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import { arrangeFieldNodeItems } from '../arrangeFieldNodeItems';
import { admitsStaticArrayTail } from '../utils/arraySlots/admitsStaticArrayTail';
import { canApplyArrayTail } from '../utils/arraySlots/canApplyArrayTail';
import { prepareArrayAppend } from '../utils/arraySlots/prepareArrayAppend';
import { prepareArrayPop } from '../utils/arraySlots/prepareArrayPop';
import { prepareArraySplice } from '../utils/arraySlots/prepareArraySplice';

describe('array verbs with item folds', () => {
  it.each([
    { keyword: 'items', later: false },
    { keyword: 'items', later: true },
    { keyword: 'prefixItems', later: false },
    { keyword: 'prefixItems', later: true },
  ] satisfies readonly { keyword: 'items' | 'prefixItems'; later: boolean }[])(
    '$keyword push, insert, remove and update use the active fold, later=$later',
    ({ keyword, later }) => {
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: !later, b: later, list: [] },
        WriteOption.Overwrite,
      );
      const list = root.structure!.list;
      const first = later ? 7 : 'first';
      const inserted = later ? 8 : 'inserted';
      const updated = later ? 9 : 'updated';
      const kind = later ? 'number' : 'string';
      expect(
        canApplyArrayTail(list, {
          kind: 'slots',
          slots: [{ value: first }],
          result: { source: 'length' },
        }),
      ).toBe(false);
      expect(arrangeFieldNodeItems(list, { kind: 'push', value: first })).toBe(
        1,
      );
      expect(list.structure!['0'].blueprintNode.kind).toBe(kind);
      expect(list.structure!['0'].raw).toBe(first);
      expect(
        arrangeFieldNodeItems(list, {
          kind: 'insert',
          index: 0,
          value: inserted,
        }),
      ).toBe(2);
      expect(list.structure!['0'].blueprintNode.kind).toBe(kind);
      expect(list.structure!['0'].raw).toBe(inserted);
      expect(arrangeFieldNodeItems(list, { kind: 'remove', index: 0 })).toBe(
        inserted,
      );
      expect(list.structure!['0'].blueprintNode.kind).toBe(kind);
      expect(list.structure!['0'].raw).toBe(first);
      expect(
        arrangeFieldNodeItems(list, {
          kind: 'update',
          index: 0,
          value: updated,
        }),
      ).toBe(updated);
      expect(list.structure!['0'].raw).toBe(updated);
      expect(list.local).toEqual([updated]);
      expect(list.runtime.loadSnapshot).toMatchObject({ list: [first] });
    },
  );

  it.each(['items', 'prefixItems'] satisfies readonly (
    | 'items'
    | 'prefixItems'
  )[])(
    '%s declines multi-candidate shortcuts and retains single-candidate shortcuts',
    (keyword) => {
      const single = createTestTree({
        type: 'array',
        items: { type: 'number' },
      }).root;
      loadFieldNodeAtMount(single, [1, 2], WriteOption.Overwrite);
      expect(admitsStaticArrayTail(single)).toBe(true);
      expect(
        prepareArrayAppend(single, { kind: 'push', value: 3 }),
      ).toBeDefined();
      expect(prepareArrayPop(single, { kind: 'pop' })).toBeDefined();
      expect(
        prepareArraySplice(single, { kind: 'insert', index: 0, value: 3 }),
      ).toBeDefined();
      expect(
        canApplyArrayTail(single, {
          kind: 'slots',
          slots: [{ from: 0 }, { from: 1 }, { value: 3 }],
          result: { source: 'length' },
        }),
      ).toBe(true);
      const { root } = createItemFoldTree(keyword);
      loadFieldNodeAtMount(
        root,
        { a: true, b: false, list: ['first'] },
        WriteOption.Overwrite,
      );
      const multi = root.structure!.list;
      expect(admitsStaticArrayTail(multi)).toBe(false);
      expect(
        prepareArrayAppend(multi, { kind: 'push', value: 'next' }),
      ).toBeUndefined();
      expect(prepareArrayPop(multi, { kind: 'pop' })).toBeUndefined();
      expect(
        prepareArraySplice(multi, { kind: 'insert', index: 0, value: 'next' }),
      ).toBeUndefined();
      expect(
        canApplyArrayTail(multi, {
          kind: 'slots',
          slots: [{ from: 0 }, { value: 'next' }],
          result: { source: 'length' },
        }),
      ).toBe(false);
    },
  );
});
