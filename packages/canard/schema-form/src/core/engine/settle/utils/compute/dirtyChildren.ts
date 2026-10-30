import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { verifyGateSelection } from '../gates/verifyGateSelection';
import { DirtyPathSet } from '../scratch/DirtyPathSet';

/**
 * Resolve only scheduled direct children instead of scanning a host's shape.
 * @param node - Branch host with the current name-to-child structure
 * @param context - Absolute dirty paths for this write
 * @returns Each live direct child on a dirty path once
 */
export const dirtyChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): Self[] => {
  const children: Self[] = [];
  const seen = new Set<Self>();
  for (const encoded of context.dirtyChildrenByParent
    .get(node.path)
    ?.values() ?? []) {
    const name = unescapeSegment(encoded);
    const child =
      node.structure && hasOwnProperty(node.structure, name)
        ? node.structure[name]
        : undefined;
    if (child && !seen.has(child)) {
      if (
        engineModes.gateSelection === 'verify' &&
        context.dirtyPaths instanceof DirtyPathSet &&
        context.dirtyPaths.isPostOrder
      )
        verifyGateSelection(
          context.dirtyPaths.has(child.path),
          'S6 dirtyChildren returned a consumed child: ' + child.path,
        );
      seen.add(child);
      children.push(child);
    }
  }
  const shadow =
    engineModes.gateSelection === 'verify'
      ? context.registrationShadow
      : undefined;
  if (shadow) {
    const expected = dirtyChildren(node, {
      ...context,
      registrationShadow: undefined,
      dirtyChildrenByParent: shadow.dirty.childrenByParent,
    });
    verifyGateSelection(
      children.length === expected.length &&
        children.every((child, index) => child === expected[index]),
      'S3 dirtyChildren members/order differ at: ' + node.path,
    );
  }
  return children;
};
