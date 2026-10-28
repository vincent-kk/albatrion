import { isArray } from '@winglet/common-utils/filter';

import {
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';

/**
 * Preserve a caller-authored JSON value over the exit's default resolver.
 * @param node - Configured departing occurrence
 * @param context - Original caller input and batch origin boundaries
 * @returns Whether the closing write explicitly supplied this value
 */
export const hasExplicitInactiveValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (
    context.kind === 'automatic' ||
    !context.writtenInputs.has(context.target)
  )
    return false;
  const lineage: Self[] = [];
  let ancestor: Self | null = node;
  for (; ancestor && ancestor !== context.target; ancestor = ancestor.parent)
    lineage.push(ancestor);
  if (!ancestor) return false;
  let input = context.writtenInputs.get(context.target);
  for (let index = lineage.length - 1; index >= 0; index--) {
    const child = lineage[index];
    if (!hasDistributedChildInput(input, child.name, isArray(input)))
      return false;
    input = Reflect.get(input, child.name);
  }
  if (!context.writeOrigins) return true;
  for (let index = context.writeOrigins.length - 1; index >= 0; index--) {
    const origin = context.writeOrigins[index];
    const path =
      origin.fields?.find(
        (field) => node.path === field || isDescendantPath(node.path, field),
      ) ?? origin.path;
    if (node.path !== path && !isDescendantPath(node.path, path)) continue;
    if (origin.keys && node.path !== path) {
      const child = getChildPointer(node.path, path);
      const name =
        child === undefined ? undefined : readPointerSegment(child, -1);
      if (typeof name !== 'string' || !origin.keys.includes(name)) continue;
    }
    return origin.source !== 'automatic';
  }
  return false;
};
