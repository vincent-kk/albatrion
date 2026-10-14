import { escapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { hasDistributedChildInput } from '../write/hasDistributedChildInput';
import { isWithinReplacePaths } from '../write/isWithinReplacePaths';

/**
 * Store, as latent raw, the declared children of a departing object host that this
 * settlement's caller write supplied but that never received a node because the host
 * left the shape in the same settlement (211C-01 A′). Each such child input is
 * distributed by its declaration's kind exactly as an absent-path write would be, so
 * re-entry recomposes it like any retained source. Automatic fills are ignored; a
 * child with a live node is captured by its own exit.
 * @param node - Departing object host whose declared children are examined
 * @param context - Settlement holding the caller's distributed inputs and replace paths
 * @param order - The host's blueprint document order
 * @returns Nothing; the root latent map receives one entry per written absent child
 */
export const distributeAbsentChildInputs = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  order: readonly number[],
): void => {
  const entries = node.blueprintNode.childEntries;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if (node.structure?.[entry.name] !== undefined) continue;
    const path = node.path + '/' + escapeSegment(entry.name);
    const distribution = isWithinReplacePaths(context, path)
      ? context.distributedInputs.get(node)
      : undefined;
    if (
      !distribution ||
      distribution.automatic ||
      !hasDistributedChildInput(distribution.input, entry.name, false)
    )
      continue;
    distributeLatentValue(
      node.runtime,
      context,
      path,
      entry.node,
      Reflect.get(distribution.input, entry.name),
      [...order, index],
      distribution.whole,
      entries,
    );
  }
};
