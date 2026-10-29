import { formatSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Add retained children whose effective schema and emitted value both changed.
 * @param host - Branch whose latest round has finished computing its children
 * @param names - Escaped identity-change names to extend without duplicates
 * @param context - Settlement-local child baselines retained between comparisons
 * @returns Nothing; appends projection names and advances each live child's baseline
 */
export const registerProjectionChanges = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  names: string[],
  context: SettlementContext<Self>,
): void => {
  const baselines = context.projectionBaselines?.get(host);
  if (!baselines) return;
  for (const [child, previous] of baselines) {
    if (host.structure?.[child.name] !== child) continue;
    if (child.schema !== previous.schema && child.emit !== previous.emit) {
      const name = formatSegment(child.name);
      if (names.indexOf(name) === -1) names.push(name);
    }
    previous.schema = child.schema;
    previous.emit = child.emit;
  }
};
