import type { CandidateInput } from '../../types/candidateInput';

/**
 * Replace the own channel of an earlier revived binding.
 * @param source - Exact channel right replaced by an accepted live write
 * @param replaceDescendants - Whole replacement of an inactive candidate binding
 * @returns Nothing; ancestor projections omit the superseded channel
 */
export const supersedeCandidateInput = (
  source: CandidateInput,
  replaceDescendants = false,
): void => {
  if (replaceDescendants)
    for (const child of source.children ?? [])
      supersedeCandidateInput(child, true);
  if (source.isSuperseded) return;
  source.isSuperseded = true;
  for (
    let parent = source.parent;
    parent && !parent.hasSupersededChild;
    parent = parent.parent
  )
    parent.hasSupersededChild = true;
};
