import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Capture bindings before an automatic array write can retire them.
 * @param host - Array before applying the next structure
 * @param context - Settlement recording boundary and optional fill evidence
 * @returns Nothing; first structure remains fixed for rollback and exit
 */
export const recordArrayBoundary = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  context: SettlementContext<Self>,
): void => {
  const source = context.retainedSources?.get(host);
  if (!source) return;
  source.array ??= {
    previousItems: [...(host.children ?? [])],
    previousItemCount: host.itemCount,
    retiredFrom: Infinity,
  };
  if (context.isCollectingFillArrayCounts) {
    const counts: Map<Self, number> = (context.fillArrayCounts ??= new Map());
    if (!counts.has(host)) counts.set(host, host.itemCount);
  }
};
