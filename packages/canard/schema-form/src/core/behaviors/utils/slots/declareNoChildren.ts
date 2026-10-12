import type { BlueprintChildEntry } from '../../../blueprint';
import type { Behavior } from '../../../record';

/** Shared immutable result for every terminal row. */
const NO_CHILDREN: readonly BlueprintChildEntry[] = Object.freeze([]);

/** Declare no children for a terminal node. */
export const declareNoChildren: Behavior['declareChildren'] = () => NO_CHILDREN;
