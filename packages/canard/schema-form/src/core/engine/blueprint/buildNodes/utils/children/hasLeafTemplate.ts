import type { MutableNode } from '../../../types/analysis';

/**
 * Tell whether an array position's candidates include a template that may hold an empty item.
 * @param candidates - Item or one tuple position's candidate templates, already carrying kind, strategy and nullability
 * @returns Whether any candidate is a terminal template that its static declaration keeps from null
 */
export const hasLeafTemplate = (
  candidates: readonly MutableNode[],
): boolean => {
  for (let index = 0; index < candidates.length; index++)
    if (
      candidates[index].strategy === 'terminal' &&
      !candidates[index].isNullable
    )
      return true;
  return false;
};
