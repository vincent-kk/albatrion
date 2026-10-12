import type { SchemaNodeRecord } from '../../../record';
import { HostLatent } from './HostLatent';

/**
 * Capture only the source channels owned by one departing occurrence.
 * @param node - Occurrence whose own state is leaving the shape
 * @param previous - Existing latent entry eligible for identity reuse
 * @returns A terminal raw, frozen host source, or no entry
 */
export const captureOwnLatent = <Self extends SchemaNodeRecord<Self>>(
  node: Self, previous: unknown,
): unknown => {
  if (node.behavior.type === 'virtual') return undefined;
  if (node.behavior.strategy === 'terminal') return node.raw;
  if (node.raw === undefined && node.extras === undefined) return undefined;
  if (previous instanceof HostLatent && Object.is(previous.raw, node.raw) &&
    Object.is(previous.extras, node.extras)) return previous;
  return new HostLatent(node.raw, node.extras);
};
