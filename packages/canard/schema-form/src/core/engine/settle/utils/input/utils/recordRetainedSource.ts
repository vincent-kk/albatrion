import type { Distribution, FieldNodeRecord } from '../../../../record';
import type {
  RetainedSource,
  SettlementContext,
} from '../../../types/settlement';

/** Index of changed live bindings, which each carry their owner and candidate. */
type RetainedSources<Self> = Map<Self, RetainedSource>;

/**
 * Capture a binding's boundary channels once and select its exit source for this write.
 * @param node - Live binding about to receive interpreted automatic input
 * @param context - Settlement local to the binding's current write segment
 * @param origin - Named input from a rule or revival, when the write has one
 * @returns Nothing; a named input supersedes any preceding fill at this binding
 */
export const recordRetainedSource = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  origin: Distribution['writeOrigin'],
): void => {
  if (origin !== undefined && context.filledNodes.delete(node))
    context.writtenInputs.delete(node);
  const sources: RetainedSources<Self> = (context.retainedSources ??=
    new Map());
  const existing = sources.get(node);
  const shouldUseBaseline = context.filledNodes.has(node);
  if (existing) existing.shouldUseBaseline = shouldUseBaseline;
  else
    sources.set(node, {
      source: node.source,
      extras: node.extras,
      distribution: context.distributedInputs.get(node),
      shouldUseBaseline,
    });
};
