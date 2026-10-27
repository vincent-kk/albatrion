import type { FieldNodeRecord } from '../../../record';
import { LiteralStarHostSource } from './LiteralStarHostSource';

/**
 * Capture only the source channels owned by one departing occurrence.
 * @param node - Occurrence whose own state is leaving the shape
 * @param previous - Existing latent entry eligible for identity reuse
 * @returns A terminal raw, frozen host source, or no entry
 */
export const captureLiteralStarOwnSource = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  previous: unknown,
): unknown => {
  if (node.behavior.type === 'virtual') return undefined;
  if (node.behavior.strategy === 'terminal') return node.raw;
  if (node.raw === undefined && node.undeclaredValues === undefined)
    return undefined;
  if (
    previous instanceof LiteralStarHostSource &&
    Object.is(previous.raw, node.raw) &&
    Object.is(previous.undeclaredValues, node.undeclaredValues)
  )
    return previous;
  return new LiteralStarHostSource(node.raw, node.undeclaredValues);
};
