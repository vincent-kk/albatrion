import type { Behavior } from '../../../record';

/** Return all blueprint child declarations for settlement to gate and create. */
export const declareBlueprintChildren: Behavior['declareChildren'] = (node) =>
  node.blueprintNode.childEntries;
