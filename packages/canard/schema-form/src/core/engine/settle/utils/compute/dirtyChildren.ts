import { hasOwnProperty } from '@winglet/common-utils/lib';

import { parsePointerSegment } from '@/schema-form/helpers/jsonPointer';

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
  const scheduled = context.dirtyChildrenByParent.get(node.path);
  const seen = scheduled && scheduled.size > 64 ? new Set<Self>() : undefined;
  for (const encoded of scheduled?.values() ?? []) {
    const name = parsePointerSegment(encoded);
    if (typeof name !== 'string') continue;
    const child =
      node.structure && hasOwnProperty(node.structure, name)
        ? node.structure[name]
        : undefined;
    if (child && !(seen ? seen.has(child) : children.indexOf(child) !== -1)) {
      if (
        engineModes.gateSelection === 'verify' &&
        context.dirtyPaths instanceof DirtyPathSet &&
        context.dirtyPaths.isPostOrder
      )
        verifyGateSelection(
          context.dirtyPaths.has(child.path),
          'S6 dirtyChildren returned a consumed child: ' + child.path,
        );
      seen?.add(child);
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
    let matches = children.length === expected.length;
    if (matches) {
      matches = true;
      for (let index = 0, count = children.length; index < count; index++) {
        const child = children[index];

        if (!(child === expected[index])) {
          matches = false;
          break;
        }
      }
    }
    verifyGateSelection(
      matches,
      'S3 dirtyChildren members/order differ at: ' + node.path,
    );
  }
  return children;
};
