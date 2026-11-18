import type { FieldNodeRecord } from '../types/record';
import { FieldNodeRevisionLedger } from './FieldNodeRevisionLedger';

/**
 * Share an immutable transition only when the caller admitted a bit-only node.
 * @param node - Record whose committed bits advance once
 * @param mask - Bits committed together
 * @param share - Already-established unobserved bit-only eligibility
 * @returns Nothing; the commit owner releases its memo on every exit
 */
export const advanceFieldNodeRevision = <Self>(
  node: FieldNodeRecord<Self>,
  mask: number,
  share: boolean,
): void => {
  const previous = node.revisionLedger;
  if (!share) {
    node.revisionLedger = new FieldNodeRevisionLedger(previous, mask);
    return;
  }
  const transitions = (node.runtime.revisionTransitions ??= new WeakMap());
  let byMask = transitions.get(previous);
  let next = byMask?.get(mask);
  if (!next) {
    next = new FieldNodeRevisionLedger(previous, mask);
    if (!byMask) {
      byMask = new Map();
      transitions.set(previous, byMask);
    }
    byMask.set(mask, next);
  }
  node.revisionLedger = next;
};
