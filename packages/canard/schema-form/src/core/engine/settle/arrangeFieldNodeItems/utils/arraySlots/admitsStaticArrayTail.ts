import { isArray } from '@winglet/common-utils/filter';

import { BEHAVIORS, getStaticChoices } from '../../../../behaviors';
import { StaticFirstLoadCapability } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';

/**
 * Tell whether a live array host admits a bounded tail verb (push or pop) without visiting its items.
 * Every condition is a fixed number of reads; the verb-specific position checks belong to the caller.
 * @param node - Write target of a public array verb, outside batch marking
 * @returns Whether the host is an active, settled static branch array whose committed local, children and emission hold one slot per item
 */
export const admitsStaticArrayTail = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const runtime = node.runtime;
  const count = node.itemCount;
  const local = node.local;
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
    runtime.latentRaw.size > 0 ||
    runtime.latentRawDirty ||
    runtime.misfitPaths.size > 0 ||
    node.raw !== undefined ||
    node.undeclaredValues !== undefined ||
    !node.blueprintNode.item ||
    !isArray(local) ||
    local.length !== count ||
    (node.children?.length ?? 0) !== count ||
    (count > 0 && !node.structure) ||
    getStaticChoices(node.schema).omitTrailing ||
    !isArray(getLoadValue(node.rootNode.emit, node.path))
  );
};
