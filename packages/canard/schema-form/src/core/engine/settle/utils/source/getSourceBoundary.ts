import type { FieldNodeRecord } from '../../../record';
import type { RetainedSource, SettlementContext } from '../../types/settlement';

/** One source address index owned by the active settlement. */
type RetainedSources<Self> = Map<Self, RetainedSource<Self>>;

/**
 * Read or capture the immutable source boundary of a changed binding.
 * @param node - Binding about to receive an automatic channel change
 * @param context - Settlement that owns the affected bindings
 * @returns Entry containing initial own channels and the mutable selection
 */
export const getSourceBoundary = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): RetainedSource<Self> => {
  const sources: RetainedSources<Self> = (context.retainedSources ??=
    new Map());
  const known = sources.get(node);
  if (known) return known;
  const baseline: RetainedSource<Self> = {
    source: node.source,
    extras: node.extras,
    distribution: context.distributedInputs.get(node),
    shouldUseBaseline: false,
  };
  sources.set(node, baseline);
  return baseline;
};
