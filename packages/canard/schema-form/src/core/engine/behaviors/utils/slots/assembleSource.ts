import type { Behavior } from '../../../record';

/** Expose a terminal node's original input without copying it. */
export const assembleSource: Behavior['assemble'] = (node) => node.source;
