import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from './getGateRegistry';

/**
 * Resolve the current host's extras under the same ancestor projection rules as its gate.
 * @param context - Current live projected tree
 * @param hostPath - Bound absolute declaration host path
 * @param raw - Publication already read at the gate's evaluation site
 * @param owner - Optional current occurrence, avoiding a redundant host traversal
 * @returns Host extras, or undefined beneath a blocking raw ancestor or absent host
 */
export const readGateProjectedExtra = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  hostPath: string,
  raw: unknown,
  owner?: Self,
): unknown => {
  let hostNode: Self | undefined;
  if (hostPath === owner?.path) hostNode = owner;
  else {
    hostNode = context.root;
    const segments = hostPath
      ? context.root.runtime.blueprint.capabilities.branchless
        ? getCachedPointerSegments(context.root.runtime, hostPath)
        : getGateRegistry(context.root.runtime).pathSegments(hostPath)
      : [];
    for (let index = 0; index < segments.length; index++) {
      const structure: Record<string, Self> | null | undefined =
        hostNode?.structure;
      const name = segments[index];
      if (typeof name !== 'string') return undefined;
      hostNode =
        structure && hasOwnProperty(structure, name)
          ? structure[name]
          : undefined;
    }
  }
  for (
    let ancestor: Self | null | undefined = hostNode;
    ancestor;
    ancestor = ancestor.parent
  )
    if (
      ancestor.behavior.strategy === 'branch' &&
      ancestor.raw !== undefined &&
      (ancestor.parent !== null ||
        raw === null ||
        typeof raw !== 'object' ||
        isArray(raw))
    )
      return undefined;
  return hostNode?.undeclaredValues;
};
