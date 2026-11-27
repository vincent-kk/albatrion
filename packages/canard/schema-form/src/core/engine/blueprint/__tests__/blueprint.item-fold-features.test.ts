import { expect, it } from 'vitest';

import { createItemFoldTree } from '../../__tests__/fixtures/createItemFoldTree';
import { buildFeatureNodeIndex } from '../utils/features/buildFeatureNodeIndex';

it.each(['items', 'prefixItems'] satisfies readonly (
  | 'items'
  | 'prefixItems'
)[])(
  '%s indexes state ownership contributed only by the later candidate',
  (keyword) => {
    const { blueprint } = createItemFoldTree(keyword, undefined, [
      {},
      { disabled: true },
    ]);
    const host = blueprint.root.childEntries.find(
      (entry) => entry.name === 'list',
    )!.node;
    expect([
      ...(buildFeatureNodeIndex(blueprint).stateKeyChildren.get(host.id) ?? []),
    ]).toEqual([keyword === 'items' ? '*' : '0']);
  },
);
