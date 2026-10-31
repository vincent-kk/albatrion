import type { FieldNodeRecord } from '../../../record';

/** Subscribe one display candidate to eligibility releases without public events.
 * @param node - Occurrence sharing the root release lifetime.
 * @param listener - External-store callback; the display performs registration catch-up.
 * @returns An idempotent cleanup removing only this listener. */
export const subscribeFieldNodeRevealReleased = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  listener: () => void,
): (() => void) => {
  const listeners = (node.rootNode.runtime.revealReleaseListeners ??=
    new Set());
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
