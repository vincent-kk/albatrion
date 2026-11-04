import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry, BlueprintNode } from '../../types/node';
import { getItemEntries } from './getItemEntries';

/**
 * Read the first authored candidate for an array position.
 * First candidate; paths that distinguish folds use the candidate list (itemCandidates / prefixItemCandidates / getItemEntries).
 * @param template - Array blueprint owning prefix or repeated item candidates
 * @param index - Nonnegative array position
 * @returns First immutable binding, or undefined for an undeclared position
 */
export const getItemEntry = (
  template: BlueprintNode,
  index: number,
): Optional<BlueprintChildEntry> => getItemEntries(template, index)[0];
