import { isArray } from '@winglet/common-utils/filter';

import { BEHAVIORS,getStaticChoices } from '../../../../behaviors';
import { StaticFirstLoadCapability } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';

/**
 * Tell whether a live array host admits a bounded tail verb (push or pop) without visiting its items.
 * Every condition is a fixed number of reads; the verb-specific position checks belong to the caller.
 * @param node - Write target of a public array verb, outside batch marking
 * @param allowUndeclared - Only append may admit a host with no item or prefix templates and an extras slot per item
 * @returns Whether the settled static branch host retains every local and emitted position with matching children or append-only undeclared slots
 */
export const admitsStaticArrayTail = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  allowUndeclared = false,
): boolean => {
  const runtime = node.runtime;
  const count = node.itemCount;
  const local = node.local;
  const extrasOnly =
    allowUndeclared &&
    !node.blueprintNode.item &&
    !node.blueprintNode.prefixItems?.length;
  return !(
    node.behavior.arrange !== BEHAVIORS.array?.branch?.arrange ||
    node.behavior.type !== 'array' ||
    node.behavior.strategy !== 'branch' ||
    node.detached ||
    !node.active ||
    !node.deliveryInitialized ||
    runtime.batchDepth ||
    runtime.visitDepth ||
    !StaticFirstLoadCapability.has(runtime.blueprint) ||
    node.inactiveSlots?.size ||
    node.inactiveSlotOverlays?.size ||
    node.inactiveSlotChildren?.size ||
    runtime.misfitPaths.size > 0 ||
    node.raw !== undefined ||
    (extrasOnly
      ? (node.children?.length ?? 0) !== 0 ||
        (isArray(node.undeclaredValues) ? node.undeclaredValues.length : 0) !==
          count
      : node.undeclaredValues !== undefined ||
        !node.blueprintNode.item ||
        (node.children?.length ?? 0) !== count) ||
    !isArray(local) ||
    local.length !== count ||
    (count > 0 && !node.structure) ||
    getStaticChoices(node.schema).omitTrailing ||
    !isArray(getLoadValue(node.rootNode.emit, node.path))
  );
};
