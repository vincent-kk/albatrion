import type { BlueprintChildEntry } from '../../../blueprint';
import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { RetainedSource, SettlementContext } from '../../types/settlement';
import { getChildDistribution } from '../input/getChildDistribution';
import { hasDistributedChildInput } from '../input/hasDistributedChildInput';
import { createSlotValueOverlay } from './createSlotValueOverlay';
import { getSlotSource } from './getSlotSource';
import { materializeKeptSlotOverlay } from './materializeKeptSlotOverlay';
import { packArrayInputOverlay } from './utils/packArrayInputOverlay';

/**
 * Read the exit's named and boundary-only child patches without replaying a working write.
 * @param node - Exiting owner of the selected storage bindings
 * @param context - Settlement providing caller coverage and budget state
 * @param retained - First boundary sources and final decisions when this owner was changed
 * @returns Interpreted patches for affected children or undefined when no overlay is needed
 */
export const readRetainedChildInputs = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  retained: RetainedSource<Self> | undefined,
): ReadonlyMap<BlueprintChildEntry, InactiveSlotOverlay> | undefined => {
  let children: Map<BlueprintChildEntry, InactiveSlotOverlay> | undefined;
  if (!context.exceededBudget) {
    for (const [entry, source] of retained?.slots ?? []) {
      const live = node.childrenByName?.[entry.name];
      const array = retained?.array;
      if (
        source.namedInput &&
        !live &&
        (!array || !retained?.shouldUseBaseline)
      ) {
        (children ??= new Map()).set(entry, source.namedInput);
        continue;
      }
      const previous = source.baseline;
      if (
        !previous ||
        (array &&
          !retained?.shouldUseBaseline &&
          Number(entry.name) >= array.retiredFrom) ||
        source.selectsNamedSource ||
        live?.blueprintNode === entry.node
      )
        continue;
      const current = getSlotSource(node, entry);
      if (
        current.instance === previous.instance &&
        current.overlay === previous.overlay
      )
        continue;
      (children ??= new Map()).set(
        entry,
        current.instance === previous.instance && previous.overlay
          ? previous.overlay
          : materializeKeptSlotOverlay(
              entry.node,
              previous.instance,
              previous.overlay,
            ),
      );
    }
  }
  const distribution =
    retained?.shouldUseBaseline && !context.exceededBudget
      ? retained.distribution
      : context.distributedInputs.get(node);
  if (
    !distribution ||
    distribution.isAutomatic ||
    distribution.shouldPreserveLatent
  )
    return children;
  const isArray = node.behavior.type === 'array';
  for (const name of Object.keys(distribution.input ?? {})) {
    if (node.childrenByName?.[name]) continue;
    const current = getChildDistribution(
      node,
      name,
      context,
      undefined,
      distribution,
    );
    if (!current || !hasDistributedChildInput(current.input, name, isArray))
      continue;
    const entry = isArray
      ? getItemEntries(node.blueprintNode, Number(name))[0]
      : node.blueprintNode.childEntries.find((entry) => entry.name === name);
    if (!entry || children?.has(entry)) continue;
    const prior = getSlotSource(node, entry);
    const { overlay } = createSlotValueOverlay(
      entry.node,
      Reflect.get(current.input, name),
      prior.instance,
      prior.overlay,
      current.isWhole,
    );
    (children ??= new Map()).set(
      entry,
      isArray && !node.blueprintNode.hasCandidateDescendants
        ? packArrayInputOverlay(overlay)
        : overlay,
    );
  }
  return children;
};
