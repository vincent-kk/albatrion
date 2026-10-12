import type { Behavior } from '../../../record';

/** Expose a terminal node's original input without copying it. */
export const assembleRaw: Behavior['assemble'] = (node) => node.raw;
