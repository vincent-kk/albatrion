import { map as mapArray } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';

import type { Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { createSlotValueOverlay } from './createSlotValueOverlay';
import { getSlotSource } from './getSlotSource';

/**
 * Preserve supplied children that departed before selection created their nodes.
 * @param node - Finally exiting source, including array positions grown by this write
 * @param context - Caller distributions and batch replacement scopes
 * @returns Missing-child source patch without changing the detached instance
 */
export const captureAbsentSlotInputs = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): Optional<InactiveSlotOverlay> => {
  const distribution = context.distributedInputs.get(node);
  if (!distribution || distribution.automatic || distribution.preserveLatent)
    return undefined;
  let children: Optional<Map<BlueprintChildEntry, InactiveSlotOverlay>>;
  const array = node.behavior.type === 'array';
  const packed = (overlay: InactiveSlotOverlay): InactiveSlotOverlay => ({
    ...overlay,
    packedArrayInput: true,
    ...(overlay.children
      ? {
          children: new Map(
            mapArray([...overlay.children], ([entry, child]) => [
              entry,
              packed(child),
            ]),
          ),
        }
      : undefined),
  });
  for (const name of Object.keys(distribution.input ?? {})) {
    if (node.structure?.[name]) continue;
    const current = getChildDistribution(node, name, context);
    if (!current || !hasDistributedChildInput(current.input, name, array))
      continue;
    const entry = array
      ? getItemEntries(node.blueprintNode, Number(name))[0]
      : node.blueprintNode.childEntries.find((entry) => entry.name === name);
    if (!entry || (array && !isArray(current.input))) continue;
    const prior = getSlotSource(node, entry);
    const result = createSlotValueOverlay(
      entry.node,
      Reflect.get(current.input, name),
      prior.source,
      prior.overlay,
      current.whole,
    );
    (children ??= new Map()).set(
      entry,
      array && !node.blueprintNode.hasCandidateDescendants
        ? packed(result.overlay)
        : result.overlay,
    );
  }
  return children ? { children } : undefined;
};
