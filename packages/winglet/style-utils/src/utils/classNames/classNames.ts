import type { ClassNamesOptions, ClassValue } from './type';
import { normalizeWhitespace } from './utils/normalizeWhitespace';
import { processClassValues } from './utils/processClassValues';

export const classNames = (
  classes: ClassValue[],
  options?: ClassNamesOptions,
): string => {
  const removeDuplicates = options?.removeDuplicates ?? true;
  const removeWhitespace = options?.normalizeWhitespace ?? true;
  const filterEmpty = options?.filterEmpty ?? true;
  let result = processClassValues(classes, removeDuplicates);
  if (filterEmpty && !result) return '';
  if (removeWhitespace && !removeDuplicates)
    result = normalizeWhitespace(result);
  return result;
};
