import type { Dictionary } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { flushPendingOutput } from '../../output/flushPendingOutput';
import { selectEntryStep } from './selectEntryStep';
import type { ChildSelectionFrame } from './selectEntryStep';

/**
 * Replay original conditional entry sites without rebuilding a proven fixed shape.
 * @param node - Host with an ordinary priming baseline retained in this mount
 * @param context - Ordinary gate inputs, selected IDs and failure collector
 * @param prior - Shape captured before this wheel's ungated start
 * @param computeChild - Existing dirty descent at the entry's original position
 * @param immediate - Whether ordinary entry changes queue host output
 * @param publication - Receives the ordinary pending-output publication result
 * @returns The ordinary changed flag, or undefined when this host is not prepared
 */
export const selectFixedFirstContributions = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Dictionary<Self>,
  computeChild: (child: Self) => void,
  immediate: boolean,
  publication?: { flushed: boolean },
): boolean | undefined => {
  const preparation = context.fixedFirstLoad;
  if (!preparation?.hosts.has(node)) return undefined;
  const plan = preparation.plan.hosts[node.blueprintNode.id];
  const frame: ChildSelectionFrame<Self> = {
    node,
    context,
    prior,
    computeChild,
    immediate,
    next: node.structure!,
    seen: new Map(),
    inactiveEntries: [],
    changed: false,
    flushReads: immediate,
  };
  for (const entry of plan.affected) selectEntryStep(entry, undefined, frame);
  const flushed = flushPendingOutput(node, context);
  if (publication) publication.flushed = flushed;
  if (frame.changed) context.changedNodes.add(node);
  return frame.changed;
};
