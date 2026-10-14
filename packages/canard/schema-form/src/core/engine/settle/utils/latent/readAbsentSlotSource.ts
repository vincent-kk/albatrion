import { isArray } from '@winglet/common-utils/filter';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { hasDistributedChildInput } from '../write/hasDistributedChildInput';
import { interpretFieldNodeInput } from '../write/interpretFieldNodeInput';
import { isWithinReplacePaths } from '../write/isWithinReplacePaths';
import { readLatentSlotSource } from './readLatentSlotSource';

/**
 * Read the source of a templated array slot that has no node while its host departs.
 * A slot the current write created (the host grew in the same settlement that closes
 * its branch) never received a node, so its value lives only in the host's distributed
 * input; that input is interpreted like an entering item. Any other slot reads its
 * retained own-kind latent source, mirroring enterFieldNode's priority (211C-01). When
 * hasDistributedChildInput accepts an array position the input is an array, so the
 * isArray guard only narrows the type and never changes the result.
 * @param host - Departing array host whose slot has no node
 * @param index - Slot position below the host's item count
 * @param template - Blueprint item template for that slot
 * @param context - Settlement holding the caller's distributed inputs and replace paths
 * @returns The interpreted written value, else the retained source, else undefined
 */
export const readAbsentSlotSource = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  index: number,
  template: BlueprintNode,
  context: SettlementContext<Self>,
): unknown => {
  const path = host.path + '/' + index;
  const distribution = isWithinReplacePaths(context, path)
    ? context.distributedInputs.get(host)
    : undefined;
  if (
    distribution &&
    !distribution.automatic &&
    hasDistributedChildInput(distribution.input, String(index), true)
  )
    return interpretFieldNodeInput(
      template,
      isArray(distribution.input) ? distribution.input[index] : undefined,
    );
  return readLatentSlotSource(context, path, template);
};
