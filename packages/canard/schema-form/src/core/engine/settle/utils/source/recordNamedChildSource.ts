import type { Distribution, FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { visitInputChildren } from '../input/visitInputChildren';
import { createSlotValueOverlay } from '../slots/createSlotValueOverlay';
import { getSlotBinding } from '../slots/getSlotBinding';
import { getSlotSource } from '../slots/getSlotSource';
import { packArrayInputOverlay } from '../slots/utils/packArrayInputOverlay';
import { getSlotDecision } from './getSlotDecision';
import { supersedeCandidateInput } from './supersedeCandidateInput';

/**
 * Capture an accepted parent input for candidates that may never enter compute.
 * @param host - Parent whose working channels are written
 * @param input - Interpreted input at the host
 * @param context - Settlement holding the exact candidate decisions
 * @param origin - Accepted named rule or revival input
 * @param previousCount - Array length just before the write, if the host is an array
 * @returns Nothing; each reached candidate keeps its latest named overlay
 */
export const recordNamedChildSource = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  input: unknown,
  context: SettlementContext<Self>,
  origin: Distribution['writeOrigin'],
  previousCount?: number,
): void => {
  const retained = context.retainedSources?.get(host);
  if (!retained) return;
  const array = retained.array;
  if (array)
    for (const slot of retained.slots?.values() ?? [])
      slot.namedInput = undefined;
  if (!origin) return;
  visitInputChildren(
    host.blueprintNode,
    input,
    undefined,
    undefined,
    (key, requested, _, value) => {
      if (
        !requested ||
        requested.node.kind === 'virtual' ||
        (!array && value === undefined)
      )
        return;
      const index = typeof key === 'number' ? key : undefined;
      const entry = getSlotBinding(host, requested);
      const slot = getSlotDecision(host, entry, context);
      if (context.isMarkingLiveRule && slot.postPolicyInput)
        supersedeCandidateInput(slot.postPolicyInput, true);
      const prior =
        !array || (index !== undefined && index < array.retiredFrom)
          ? getSlotSource(host, entry)
          : undefined;
      if (value === undefined && (!array || prior?.instance || prior?.overlay))
        return;
      const { overlay } = createSlotValueOverlay(
        entry.node,
        value,
        prior?.instance,
        slot.namedInput ?? prior?.overlay,
        true,
      );
      slot.namedInput =
        array && !host.blueprintNode.hasCandidateDescendants
          ? packArrayInputOverlay(overlay)
          : overlay;
    },
    (key) =>
      !host.childrenByName?.[key] ||
      (previousCount !== undefined && Number(key) >= previousCount),
  );
};
