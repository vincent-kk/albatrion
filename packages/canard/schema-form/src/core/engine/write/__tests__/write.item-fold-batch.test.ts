import { expect, it } from 'vitest';

import { createItemFoldTree } from '../../__tests__/fixtures/createItemFoldTree';
import { loadFieldNodeAtMount } from '../../settle';
import { WriteOption } from '../../types/value';
import { markBatchArrayOperation } from '../utils/chain/markBatchArrayOperation';

it.each(['items', 'prefixItems'] satisfies readonly (
  | 'items'
  | 'prefixItems'
)[])(
  '%s interprets batch update and remove results with the live later fold',
  (keyword) => {
    const { root } = createItemFoldTree(keyword);
    loadFieldNodeAtMount(
      root,
      { a: false, b: true, list: [7] },
      WriteOption.Overwrite,
    );
    const list = root.structure!.list;
    expect(
      markBatchArrayOperation(list, { kind: 'update', index: 0, value: 12 }),
    ).toBe(12);
    expect(markBatchArrayOperation(list, { kind: 'remove', index: 0 })).toBe(
      12,
    );
    const empty = createItemFoldTree(keyword).root;
    loadFieldNodeAtMount(
      empty,
      { a: false, b: true, list: [] },
      WriteOption.Overwrite,
    );
    const pending = empty.structure!.list;
    expect(markBatchArrayOperation(pending, { kind: 'push', value: 7 })).toBe(
      1,
    );
    expect(
      markBatchArrayOperation(pending, { kind: 'update', index: 0, value: 12 }),
    ).toBe(12);
    expect(markBatchArrayOperation(pending, { kind: 'remove', index: 0 })).toBe(
      12,
    );
  },
);
