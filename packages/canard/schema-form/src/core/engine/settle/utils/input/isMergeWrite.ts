import { WriteOption } from '../../../types/value';

/**
 * Resolve the caller's replacement options.
 * @param option - Flags carried by this caller write
 * @returns True when Merge applies without an explicit replacement
 */
export const isMergeWrite = (option: WriteOption): boolean =>
  !!(option & WriteOption.Merge) && !(option & WriteOption.Replace);
