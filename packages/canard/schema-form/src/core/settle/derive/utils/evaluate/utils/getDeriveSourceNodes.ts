import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveState } from '../../../type';

/**
 * Resolve affected declaration hosts without descending unrelated branches.
 * @param root - Current live root
 * @param state - Load-wide or indexed non-load source addresses
 * @returns Roots for a full load scan or exact affected live sources
 */
export const getDeriveSourceNodes = <Self extends SchemaNodeRecord<Self>>(
  root: Self, state: DeriveState<Self>,
): Self[] => {
  if (!state.sourcePaths) return [root];
  const nodes: Self[] = [];
  for (const path of state.sourcePaths) {
    let node: Self | undefined = root;
    for (const encoded of path.split('/').slice(1)) {
      const name = unescapeSegment(encoded);
      const children: Record<string, Self> | null = node?.structure ?? null;
      node = children && hasOwnProperty(children, name) ? children[name] : undefined;
      if (!node) break;
    }
    if (node && !nodes.includes(node)) nodes.push(node);
  }
  return nodes;
};
