import type { Behavior } from '../../../record';

/** One wrapper per base assembly, so item leaf rows wrapping the same base share one slot function. */
const WRAPPERS = new WeakMap<Behavior['assemble'], Behavior['assemble']>();

/**
 * Wrap a leaf row's assembly so that a stored null reads as no value.
 * @param assemble - Assembly of the base row, called with the same arguments for every other source
 * @returns The shared wrapper of this base assembly; it returns undefined for a null source
 */
export const wrapItemLeafAssemble = (
  assemble: Behavior['assemble'],
): Behavior['assemble'] => {
  let wrapper = WRAPPERS.get(assemble);
  if (wrapper === undefined) {
    wrapper = (node, children, recalculated, hint) =>
      node.source === null
        ? undefined
        : assemble(node, children, recalculated, hint);
    WRAPPERS.set(assemble, wrapper);
  }
  return wrapper;
};
