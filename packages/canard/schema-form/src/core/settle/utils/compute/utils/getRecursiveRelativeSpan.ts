import type { Blueprint } from '../../../../blueprint';

/** One maximum authored relative read per immutable blueprint. */
const RELATIVE_SPANS = new WeakMap<Blueprint, number>();

/**
 * Memoize the whole-blueprint span shared by recursive expansion and fill.
 * @param blueprint - Immutable templates whose authored reads bound repetition
 * @returns Largest relative ancestor read, or zero when no relative read exists
 */
export const getRecursiveRelativeSpan = (blueprint: Blueprint): number => {
  let span = RELATIVE_SPANS.get(blueprint);
  if (span !== undefined) return span;
  span = 0;
  const templates = blueprint.nodes;
  for (let index = 0; index < templates.length; index++) {
    const declarations = templates[index].declarations;
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
      const gates = declarations[declarationIndex].gates;
      for (let gateIndex = 0; gateIndex < gates.length; gateIndex++) {
        const reads = gates[gateIndex].evaluationReads;
        for (let readIndex = 0; readIndex < reads.length; readIndex++) {
          const read = reads[readIndex];
          if (typeof read === 'number' && read > span) span = read;
        }
      }
    }
  }
  RELATIVE_SPANS.set(blueprint, span);
  return span;
};
