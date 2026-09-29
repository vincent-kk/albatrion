import { unescapeSegment } from '@winglet/json/pointer';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Resolve only scheduled direct children instead of scanning a host's shape.
 * @param node - Branch host with the current name-to-child structure
 * @param context - Absolute dirty paths for this write
 * @returns Each live direct child on a dirty path once
 */
export const dirtyChildren = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): Self[] => {
  const prefix = `${node.path}/`;
  const children: Self[] = [];
  for (const path of context.dirtyPaths) {
    if (!path.startsWith(prefix)) continue;
    const remaining = path.slice(prefix.length);
    const encoded = remaining.split('/')[0];
    const name = unescapeSegment(encoded);
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child && !children.includes(child)) children.push(child);
  }
  return children;
};
