import type { FieldNodeRecord } from '../types/record';

/** Advance the reveal transaction only at a public outer entry or walk.
 * @param node - Occurrence sharing entry and walk depth.
 * @returns Nothing; nested entries reuse the current sequence. */
export const advanceFieldNodeRevealSequence = <Self>(
  node: FieldNodeRecord<Self>,
): void => {
  const runtime = node.runtime;
  if (!runtime.entryDepth && !runtime.visitDepth)
    runtime.revealWriteSequence = (runtime.revealWriteSequence ?? 0) + 1;
};
