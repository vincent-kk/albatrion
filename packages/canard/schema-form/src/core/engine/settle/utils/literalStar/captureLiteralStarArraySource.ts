import { isArray } from '@winglet/common-utils/filter';

import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { LiteralStarHostSource } from '../literalStarStore/LiteralStarHostSource';
import { getLiteralStarPathIndex } from '../literalStarStore/getLiteralStarPathIndex';
import { readAbsentSlotSource } from '../slots/readAbsentSlotSource';
import { readSourceTree } from '../slots/readSourceTree';

/**
 * Capture one array host as one frozen raw array.
 * A templated slot uses its item's raw tree, including empty-source array slots;
 * a gated-out slot uses its retained own-kind latent source before host capture, and a
 * written slot without a node uses this call's distributed input (211C-01);
 * candidate-bearing slot subtrees retain their per-candidate latent keys;
 * an untemplated tail slot uses extras at the matching tail position.
 * @param node - Departing array branch with its final slot nodes
 * @param context - Latent-aware source test for templated item slots
 * @returns Frozen whole-array host latent
 */
export const captureLiteralStarArraySource = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  context: SettlementContext<Self>,
): LiteralStarHostSource => {
  const slots: unknown[] = [];
  let retainedItemNames: string[] | undefined;
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const candidates = getItemEntries(node.blueprintNode, index);
    if (candidates.length === 0) {
      slots.push(
        isArray(node.undeclaredValues)
          ? node.undeclaredValues[index - tailStart]
          : undefined,
      );
      continue;
    }
    tailStart++;
    const item = node.structure?.[String(index)];
    if (
      (candidates.length > 1 || candidates[0]?.node.hasCandidateDescendants) &&
      (item ||
        getLiteralStarPathIndex(context).get(node.path + '/' + index)?.size)
    )
      (retainedItemNames ??= []).push(String(index));
    if (item) {
      slots.push(readSourceTree(item, context));
      continue;
    }
    slots.push(readAbsentSlotSource(node, index, candidates, context));
  }
  return new LiteralStarHostSource(
    Object.freeze(slots),
    undefined,
    retainedItemNames,
  );
};
