import { isArray } from '@winglet/common-utils/filter';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { interpretFieldNodeInput } from '../input/interpretFieldNodeInput';
import { readInactiveSlotSource } from './readInactiveSlotSource';

/**
 * Read the source of a templated array slot that has no node while its host departs.
 * A slot the current write created (the host grew in the same settlement that closes
 * its branch) never received a node, so its value lives only in the host's distributed
 * input; a single candidate interprets that input, while multiple candidates retain it
 * until selection. Any other slot reads its
 * retained own-kind latent source, mirroring enterFieldNode's priority (211C-01). When
 * hasDistributedChildInput accepts an array position the input is an array, so the
 * isArray guard only narrows the type and never changes the result.
 * @param host - Departing array host whose slot has no node
 * @param index - Slot position below the host's item count
 * @param candidates - All authored bindings for this templated position
 * @param context - Settlement holding the caller's distributed inputs and replace paths
 * @returns Written input interpreted only for a single candidate, else the retained source, else undefined
 */
export const readAbsentSlotSource = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  index: number,
  candidates: readonly BlueprintChildEntry[],
  context: SettlementContext<Self>,
): unknown => {
  const name = String(index);
  const path = appendSegment(host.path, name);
  const distribution = getChildDistribution(host, name, context, path);
  if (
    distribution &&
    !distribution.automatic &&
    hasDistributedChildInput(distribution.input, name, true)
  ) {
    const input = isArray(distribution.input)
      ? distribution.input[index]
      : undefined;
    return candidates.length === 1
      ? interpretFieldNodeInput(candidates[0].node, input)
      : input;
  }
  for (const candidate of candidates) {
    const source = readInactiveSlotSource(context, path, candidate.node);
    if (source !== undefined) return source;
  }
  return undefined;
};
