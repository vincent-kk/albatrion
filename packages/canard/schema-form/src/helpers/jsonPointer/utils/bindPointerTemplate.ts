import { PointerOperator } from '../constants/PointerOperator';
import { hasPointerOperator } from './hasPointerOperator';

/** Bind canonical array-template addresses without allocating segment arrays. */
export const bindPointerTemplate = (
  templatePath: string,
  occurrencePath: string,
): string => {
  if (!hasPointerOperator(templatePath, PointerOperator.Wildcard))
    return templatePath;
  let templateStart = 0;
  let occurrenceStart = 0;
  let copiedThrough = 0;
  let bound = '';
  while (templateStart < templatePath.length) {
    const templateSlash = templatePath.indexOf('/', templateStart + 1);
    const templateEnd = templateSlash < 0 ? templatePath.length : templateSlash;
    const occurrenceSlash = occurrencePath.indexOf('/', occurrenceStart + 1);
    const occurrenceEnd =
      occurrenceSlash < 0 ? occurrencePath.length : occurrenceSlash;
    if (
      templateEnd === templateStart + 2 &&
      templatePath[templateStart + 1] === '*' &&
      occurrenceStart < occurrencePath.length
    ) {
      bound += templatePath.slice(copiedThrough, templateStart + 1);
      bound += occurrencePath.slice(occurrenceStart + 1, occurrenceEnd);
      copiedThrough = templateEnd;
    }
    templateStart = templateEnd;
    occurrenceStart = occurrenceEnd;
  }
  return bound ? bound + templatePath.slice(copiedThrough) : templatePath;
};
