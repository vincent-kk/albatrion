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
  const children: Self[] = [];
  const seen = new Set<Self>();
  for (const encoded of context.dirtyChildrenByParent.get(node.path)?.values() ?? []) {
    const name = unescapeSegment(encoded);
    const child = node.structure && hasOwnProperty(node.structure, name)
      ? node.structure[name] : undefined;
    if (child && !seen.has(child)) {
      seen.add(child);
      children.push(child);
    }
  }
  return children;
};
