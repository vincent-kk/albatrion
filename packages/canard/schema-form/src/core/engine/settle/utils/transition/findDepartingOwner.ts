import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import {
  appendSegment,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { DepartingAddress } from '../../types/departingWrite';
import type { SettlementContext } from '../../types/settlement';
import { findDepartingChild } from './findDepartingChild';

/**
 * Find the node leaving in this settlement on the way to an address that has no live node.
 * Derive runs after compute decided exits, so a declarative write that names the leaving node or an
 * address below it, by its own path, is kept until the exit policy has run (WRITE-079).
 * @param root - Live root the address is resolved from
 * @param path - Absolute data address of a latent declarative target
 * @param context - Settlement holding the pending exits
 * @returns The leaving node and the address below it, or undefined when no leaving node is on the path
 */
export const findDepartingOwner = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  context: SettlementContext<Self>,
): Optional<DepartingAddress<Self>> => {
  if (context.pendingExits.size === 0) return undefined;
  const segments = parsePointerSegments(path);
  let host = root;
  for (let index = 0; index < segments.length; index++) {
    const name = segments[index];
    if (typeof name !== 'string') return undefined;
    const children = host.childrenByName;
    if (children && hasOwnProperty(children, name)) {
      host = children[name];
      continue;
    }
    const node = findDepartingChild(host, name, context);
    if (!node) return undefined;
    let suffix = '';
    for (let rest = index + 1; rest < segments.length; rest++) {
      const segment = segments[rest];
      if (typeof segment !== 'string') return undefined;
      suffix = appendSegment(suffix, segment);
    }
    return { node, suffix, depth: node.depth + segments.length - index - 1 };
  }
  return undefined;
};
