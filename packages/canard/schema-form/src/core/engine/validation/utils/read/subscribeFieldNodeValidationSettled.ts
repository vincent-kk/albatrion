import type { FieldNodeRecord } from '../../../record';

/** Subscribe a binding to the end of a pending write verdict.
 * @param node - Occurrence whose runtime owns the lifetime.
 * @param listener - Callback notified only on a true-to-false transition.
 * @returns The subscription cleanup. */
export const subscribeFieldNodeValidationSettled = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  listener: () => void,
): (() => void) => {
  const listeners = (node.rootNode.runtime.validationSettleListeners ??=
    new Set());
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
