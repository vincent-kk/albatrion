import type { FieldNodeRecord } from '../../../record';

/**
 * Read the interaction lifetime used to discard deferred touched callbacks.
 * @param node - Live or retired occurrence whose lifetime is observed
 * @returns Its monotone counter, independent of event revisions
 */
export const readFieldNodeInteractionReset = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): number => node.interactionReset;
