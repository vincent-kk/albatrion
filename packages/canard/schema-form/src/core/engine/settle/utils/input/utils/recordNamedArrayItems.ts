import { isArray } from '@winglet/common-utils/filter';

import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import type {
  Distribution,
  FieldNodeRecord,
  InactiveSlotOverlay,
} from '../../../../record';
import type {
  RetainedArraySources,
  SettlementContext,
} from '../../../types/settlement';
import { createSlotValueOverlay } from '../../slots/createSlotValueOverlay';
import { getSlotSource } from '../../slots/getSlotSource';
import { packArrayInputOverlay } from '../../slots/utils/packArrayInputOverlay';

/** Arrays whose automatic writes changed the binding generation or named slots. */
type RetainedArrays<Self> = Map<Self, RetainedArraySources>;

/**
 * Record named positions that compute may never instantiate and retire shortened bindings.
 * @param host - Array after its working length was updated, before child selection
 * @param input - Interpreted input for this array write
 * @param previousCount - Working length immediately before the write
 * @param context - Settlement owning this array lifetime
 * @param origin - Accepted named input, if this is a rule or revival
 * @returns Nothing; positions outside the length cannot inherit retired bindings
 */
export const recordNamedArrayItems = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  input: unknown,
  previousCount: number,
  context: SettlementContext<Self>,
  origin: Distribution['writeOrigin'],
): void => {
  const arrays: RetainedArrays<Self> = (context.retainedArrays ??= new Map());
  let array = arrays.get(host);
  if (!array) {
    array = { retiredFrom: Infinity };
    arrays.set(host, array);
  }
  if (host.itemCount < previousCount)
    array.retiredFrom = Math.min(array.retiredFrom, host.itemCount);
  let items: Map<BlueprintChildEntry, InactiveSlotOverlay> | undefined;
  if (origin && isArray(input))
    for (let index = 0; index < input.length; index++) {
      if (index < previousCount && host.childrenByName?.['' + index]) continue;
      const entry = getItemEntries(host.blueprintNode, index)[0];
      if (!entry) continue;
      const prior =
        index < array.retiredFrom ? getSlotSource(host, entry) : undefined;
      if (
        input[index] === undefined &&
        prior &&
        (prior.instance || prior.overlay)
      )
        continue;
      const { overlay } = createSlotValueOverlay(
        entry.node,
        input[index],
        prior?.instance,
        prior?.overlay,
        true,
      );
      (items ??= new Map()).set(
        entry,
        host.blueprintNode.hasCandidateDescendants
          ? overlay
          : packArrayInputOverlay(overlay),
      );
    }
  array.namedItems = items;
};
