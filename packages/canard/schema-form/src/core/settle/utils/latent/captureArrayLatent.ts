import { getItemEntry } from '../../../blueprint';
import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { HostLatent } from './HostLatent';
import { readLatentSlotSource } from './readLatentSlotSource';
import { readRawTree } from './readRawTree';

/**
 * Capture one array host as one frozen raw array.
 * A templated slot uses its item's raw tree, including empty-source array slots;
 * a gated-out slot uses its retained own-kind latent source before host capture;
 * an untemplated tail slot uses extras at the matching tail position.
 * @param node - Departing array branch with its final slot nodes
 * @param context - Latent-aware source test for templated item slots
 * @returns Frozen whole-array host latent
 */
export const captureArrayLatent = <Self extends SchemaNodeRecord<Self>>(
  node: Self, context: SettlementContext<Self>,
): HostLatent => {
  const slots: unknown[] = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) {
      slots.push(isArray(node.extras) ? node.extras[index - tailStart] : undefined);
      continue;
    }
    tailStart++;
    const item = node.structure?.[String(index)];
    if (item) {
      slots.push(readRawTree(item, context));
      continue;
    }
    slots.push(readLatentSlotSource(context,
      `${node.path}/${index}`, entry.node));
  }
  return new HostLatent(Object.freeze(slots), undefined);
};
