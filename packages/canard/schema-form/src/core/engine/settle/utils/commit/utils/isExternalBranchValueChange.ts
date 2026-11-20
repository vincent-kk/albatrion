import { equals as isEqualRelayArray } from '@winglet/common-utils/object';

import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../../record';
import { FieldNodeWriteKind } from '../../../../types/value';
import type { SettlementContext } from '../../../types/settlement';
import { isRelayedInput } from './isRelayedInput';
import { readSettlementSource } from './readSettlementSource';

/**
 * Distinguish a branch input's own value from external or automatic descendant writes.
 * @param context - Final write provenance and automatic operations before commit.
 * @param node - Branch whose committed value changed.
 * @returns Whether whole-value inputs must capture a new default value.
 */
export const isExternalBranchValueChange = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  node: Self,
): boolean => {
  const relays = node.runtime.inputRelays;
  if (relays && isRelayedInput(relays, node.path, isEqualRelayArray)) return false;
  for (const automatic of context.automaticLog)
    if (
      !automatic.isDistributionOnly &&
      (automatic.node === node ||
        isDescendantPath(automatic.node.path, node.path))
    )
      return true;
  if (context.writeOrigins?.length)
    for (const changed of context.changedSource) {
      if (changed !== node.path && !isDescendantPath(changed, node.path))
        continue;
      const source = readSettlementSource(context, changed, true);
      if (source !== undefined) {
        if (source !== FieldNodeWriteKind.Input || changed !== node.path)
          return true;
      }
    }
  if (context.writeOrigins?.length)
    return (
      readSettlementSource(context, node.path, true) !== FieldNodeWriteKind.Input
    );
  return (
    node !== context.target ||
    readSettlementSource(context, node.path) !== FieldNodeWriteKind.Input
  );
};
