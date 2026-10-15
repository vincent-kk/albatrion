import { isArray } from '@winglet/common-utils/filter';

import { BEHAVIORS, getStaticChoices } from '../../../../behaviors';
import {
  StaticFirstLoadCapability,
  getItemEntry,
  mergeEffectiveSchema,
} from '../../../../blueprint';
import type { ArrayOperation, FieldNodeRecord } from '../../../../record';
import type { ArrayAppendProof } from '../../../types/settlement';
import { getLoadValue } from '../../../utils/loadValues/getLoadValue';

/** Ungated effective schemas select their immutable static contributions. */
const NO_ACTIVE_IDS: readonly number[] = Object.freeze([]);

/** Shared result reporting the array length after a push. */
const LENGTH_RESULT = { source: 'length' } as const;

/**
 * Admit a lone push on a static array to the bounded append path without visiting its items.
 * Writes nothing; every condition is a fixed number of reads, so a declined call costs O(1).
 * @param node - Write target of a public array verb, outside batch marking
 * @param operation - Requested structural operation
 * @returns Call-local append proof, or undefined when the general plan must run
 */
export const prepareArrayAppend = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): ArrayAppendProof<Self> | undefined => {
  if (operation.kind !== 'push') return undefined;
  const runtime = node.runtime;
  const template = node.blueprintNode;
  const count = node.itemCount;
  const local = node.local;
  if (
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
    !template.item ||
    count < (template.prefixItems?.length ?? 0) ||
    !isArray(local) ||
    local.length !== count ||
    (node.children?.length ?? 0) !== count ||
    (count > 0 && !node.structure) ||
    getStaticChoices(node.schema).omitTrailing ||
    !isArray(getLoadValue(node.rootNode.emit, node.path))
  )
    return undefined;
  const entry = getItemEntry(template, count);
  if (!entry || entry.node.kind === 'virtual' || !entry.declarations.length)
    return undefined;
  const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, {
    mode: 'runtime',
    isAtomic: runtime.blueprint.isAtomic,
  });
  if (schema.typeConflict) return undefined;
  return {
    host: node,
    count,
    entry,
    schema,
    plan: {
      kind: 'slots',
      slots: [{ value: operation.value }],
      result: LENGTH_RESULT,
    },
    local,
    valid: true,
  };
};
