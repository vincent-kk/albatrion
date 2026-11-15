import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';

/**
 * Keep a root object or array from omitting itself under omitEmpty (settle-root-emission).
 * @param node - Node whose row projected `local` into `emit`
 * @param local - Assembled value the projection read
 * @param emit - Projected value of `local`
 * @returns `emit` unless a root object or array projected to absence; then `local` when it is already empty, or a new empty array when omitTrailingEmpty trimmed every item
 */
export const keepRootEmit = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  local: unknown,
  emit: unknown,
): unknown => {
  if (
    node.parent !== null ||
    emit !== undefined ||
    (node.behavior.type !== 'object' && node.behavior.type !== 'array')
  )
    return emit;
  return isArray(local) && local.length > 0 ? [] : local;
};
