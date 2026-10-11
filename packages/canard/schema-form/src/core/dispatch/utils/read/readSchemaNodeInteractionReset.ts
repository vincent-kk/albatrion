import type { SchemaNodeRecord } from '../../../record';

/**
 * Read the interaction lifetime used to discard deferred touched callbacks.
 * @param node - Live or retired occurrence whose lifetime is observed
 * @returns Its monotone counter, independent of event revisions
 */
export const readSchemaNodeInteractionReset = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): number => node.interactionReset;
